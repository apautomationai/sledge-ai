import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@/helpers/errors";
import { googleServices } from "@/services/google.services";
import { invoiceServices } from "@/services/invoice.services";
import { attachmentServices } from "@/services/attachment.services";
import { getStringParam, getIntParam } from "@/helpers/request-utils";

class JobsController {
    async getJobById(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const jobId = getIntParam(req.params.id);

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!jobId || isNaN(jobId)) {
                throw new BadRequestError("Need a valid job ID");
            }

            // Get the attachment (job)
            const attachment = await attachmentServices.getAttachmentById(jobId);

            if (!attachment) {
                throw new NotFoundError("Job not found");
            }

            // Verify the attachment belongs to the user
            if (attachment.userId !== userId) {
                throw new NotFoundError("Job not found");
            }

            // Get associated invoices
            const invoices = await invoiceServices.getInvoicesByAttachmentId(jobId);

            // Get vendor data from QuickBooks if available
            let vendorData = null;
            if (invoices.length > 0) {
                // Find the first invoice with a vendorId
                const invoiceWithVendor = invoices.find((inv: any) => inv.vendorId);
                if (invoiceWithVendor?.vendorId) {
                    try {
                        vendorData = await invoiceServices.getQuickBooksVendorById(invoiceWithVendor.vendorId);
                    } catch (error) {
                        console.error(`Failed to fetch vendor data for vendorId ${invoiceWithVendor.vendorId}:`, error);
                    }
                }
            }

            // Calculate job status
            let jobStatus: "pending" | "processing" | "processed" | "approved" | "rejected" | "failed" = "pending";
            const invoiceCount = invoices.length;

            if (attachment.status === "pending") {
                jobStatus = "pending";
            } else if (attachment.status === "processing") {
                jobStatus = "processing";
            } else if (attachment.status === "failed") {
                jobStatus = "failed";
            } else if (attachment.status === "success" || attachment.status === "completed") {
                if (invoiceCount > 0) {
                    const activeInvoices = invoices.filter((inv: any) => inv.status !== "deleted");
                    const statuses = activeInvoices.map((inv: any) => inv.status);

                    const hasPending = statuses.some((s: string) => s === "pending" || s === "processing");
                    const hasFailed = statuses.some((s: string) => s === "failed");
                    const allApprovedOrRejected = statuses.every((s: string) => s === "approved" || s === "rejected");

                    if (hasFailed) {
                        jobStatus = "failed";
                    } else if (allApprovedOrRejected && statuses.length > 0) {
                        jobStatus = "approved";
                    } else if (hasPending) {
                        jobStatus = "processed";
                    } else {
                        jobStatus = "processed";
                    }
                } else {
                    jobStatus = "processed";
                }
            } else {
                jobStatus = "processed";
            }

            // Calculate invoice status breakdown
            const activeInvoices = invoices.filter((inv: any) => inv.status !== "deleted");
            const invoiceStatusCounts = {
                approved: activeInvoices.filter((inv: any) => inv.status === "approved").length,
                rejected: activeInvoices.filter((inv: any) => inv.status === "rejected").length,
                pending: activeInvoices.filter((inv: any) => inv.status === "pending" || inv.status === "processing").length,
            };

            const result = {
                status: "success",
                data: {
                    ...attachment,
                    invoiceCount,
                    jobStatus,
                    vendorData,
                    invoiceStatusCounts,
                },
            };

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get job",
            });
        }
    }

    async getJobs(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            const page = getIntParam(req.query.page) || 1;
            const limit = getIntParam(req.query.limit) || 20;
            const statusFilter = getStringParam(req.query.status) || "all";
            const sortBy = getStringParam(req.query.sortBy) || "received";
            const sortOrder = getStringParam(req.query.sortOrder) || "desc";
            const searchQuery = getStringParam(req.query.search) || "";

            // Get attachments (jobs)
            const attachmentsData = await googleServices.getAttachments(
                userId,
                page,
                limit
            );

            //@ts-ignore
            const attachments = attachmentsData.attachments || [];

            // For each attachment, get associated invoices and calculate status
            let jobsWithStatus = await Promise.all(
                attachments.map(async (attachment: any) => {
                    try {
                        // Get invoices for this attachment
                        const invoices = await invoiceServices.getInvoicesByAttachmentId(
                            attachment.id
                        );

                        // Get vendor data from QuickBooks if available
                        let vendorData = null;
                        if (invoices.length > 0) {
                            // Find the first invoice with a vendorId
                            const invoiceWithVendor = invoices.find((inv: any) => inv.vendorId);
                            if (invoiceWithVendor?.vendorId) {
                                try {
                                    vendorData = await invoiceServices.getQuickBooksVendorById(invoiceWithVendor.vendorId);
                                } catch (error) {
                                    console.error(`Failed to fetch vendor data for vendorId ${invoiceWithVendor.vendorId}:`, error);
                                }
                            }
                        }

                        // Calculate job status based on attachment status and invoice statuses
                        let jobStatus: "pending" | "processing" | "processed" | "approved" | "rejected" | "failed" = "pending";
                        const invoiceCount = invoices.length;

                        // Check attachment status first
                        if (attachment.status === "pending") {
                            jobStatus = "pending";
                        } else if (attachment.status === "processing") {
                            jobStatus = "processing";
                        } else if (attachment.status === "failed") {
                            jobStatus = "failed";
                        } else if (attachment.status === "success" || attachment.status === "completed") {
                            // Attachment processed successfully, now check invoice statuses
                            if (invoiceCount > 0) {
                                // Filter out deleted invoices
                                const activeInvoices = invoices.filter((inv: any) => inv.status !== "deleted");
                                const statuses = activeInvoices.map((inv: any) => inv.status);

                                const hasPending = statuses.some((s: string) => s === "pending" || s === "processing");
                                const hasFailed = statuses.some((s: string) => s === "failed");
                                const allApprovedOrRejected = statuses.every((s: string) => s === "approved" || s === "rejected");

                                if (hasFailed) {
                                    jobStatus = "failed";
                                } else if (allApprovedOrRejected && statuses.length > 0) {
                                    // All invoices are either approved or rejected (any combination)
                                    jobStatus = "approved";
                                } else if (hasPending) {
                                    // At least one invoice needs review
                                    jobStatus = "processed";
                                } else {
                                    jobStatus = "processed";
                                }
                            } else {
                                // No invoices yet, but attachment is processed
                                jobStatus = "processed";
                            }
                        } else {
                            // Default to processed for any other status
                            jobStatus = "processed";
                        }

                        // Calculate invoice status breakdown (excluding deleted)
                        const activeInvoices = invoices.filter((inv: any) => inv.status !== "deleted");
                        const invoiceStatusCounts = {
                            approved: activeInvoices.filter((inv: any) => inv.status === "approved").length,
                            rejected: activeInvoices.filter((inv: any) => inv.status === "rejected").length,
                            pending: activeInvoices.filter((inv: any) => inv.status === "pending" || inv.status === "processing").length,
                        };

                        return {
                            ...attachment,
                            invoiceCount,
                            jobStatus,
                            invoiceStatusCounts,
                            vendorData,
                            duplicateInvoices: activeInvoices.filter((inv: any) => inv.isDuplicate).length,
                        };
                    } catch (error) {
                        console.error(`Failed to fetch invoices for attachment ${attachment.id}:`, error);
                        return {
                            ...attachment,
                            invoiceCount: 0,
                            jobStatus: "pending" as const,
                            invoiceStatusCounts: { approved: 0, rejected: 0, pending: 0 },
                            duplicateInvoices: 0,
                        };
                    }
                })
            );

            // Calculate status counts before filtering
            const statusCounts = {
                all: jobsWithStatus.length,
                pending: jobsWithStatus.filter((j: any) => j.jobStatus === "pending").length,
                processing: jobsWithStatus.filter((j: any) => j.jobStatus === "processing").length,
                processed: jobsWithStatus.filter((j: any) => j.jobStatus === "processed").length,
                approved: jobsWithStatus.filter((j: any) => j.jobStatus === "approved" || j.jobStatus === "rejected").length,
                failed: jobsWithStatus.filter((j: any) => j.jobStatus === "failed").length,
            };

            // Apply status filter
            if (statusFilter !== "all") {
                jobsWithStatus = jobsWithStatus.filter((job: any) => job.jobStatus === statusFilter);
            }

            // Apply search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                jobsWithStatus = jobsWithStatus.filter((job: any) => {
                    return (
                        job.filename.toLowerCase().includes(searchLower) ||
                        job.sender.toLowerCase().includes(searchLower) ||
                        job.receiver.toLowerCase().includes(searchLower)
                    );
                });
            }

            // Apply sorting
            jobsWithStatus.sort((a: any, b: any) => {
                let comparison = 0;

                switch (sortBy) {
                    case "job":
                        comparison = String(a.id).localeCompare(String(b.id));
                        break;
                    case "source":
                        const sourceA = a.provider || "";
                        const sourceB = b.provider || "";
                        comparison = sourceA.localeCompare(sourceB);
                        break;
                    case "email":
                        const emailA = a.sender || "";
                        const emailB = b.sender || "";
                        comparison = emailA.localeCompare(emailB);
                        break;
                    case "received":
                        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                        break;
                    case "invoices":
                        comparison = a.invoiceCount - b.invoiceCount;
                        break;
                    case "status":
                        const statusOrder = ["pending", "processing", "processed", "approved", "failed"];
                        const statusA = statusOrder.indexOf(a.jobStatus);
                        const statusB = statusOrder.indexOf(b.jobStatus);
                        comparison = statusA - statusB;
                        break;
                    default:
                        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }

                return sortOrder === "asc" ? comparison : -comparison;
            });

            const result = {
                status: "success",
                data: {
                    jobs: jobsWithStatus,
                    statusCounts,
                    pagination: {
                        //@ts-ignore
                        totalJobs: attachmentsData.totalAttachments || 0,
                        page,
                        limit,
                        //@ts-ignore
                        totalPages: Math.ceil((attachmentsData.totalAttachments || 0) / limit),
                    },
                },
            };

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get jobs",
            });
        }
    }
}

export const jobsController = new JobsController();
