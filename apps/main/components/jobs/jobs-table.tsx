import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight, FileText, MoreVertical, RefreshCcw } from "lucide-react";
import { client } from "@/lib/axios-client";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { VendorData } from "@/hooks/use-jobs";

interface Invoice {
    id: number;
    invoiceNumber: string;
    totalAmount: string | null;
    status: string | null;
    createdAt: string;
    vendorData: VendorData
}

export interface Job {
    id: string;
    filename: string;
    sender: string;
    receiver: string;
    provider?: string;
    created_at: string;
    invoiceCount: number;
    jobStatus: "pending" | "processing" | "processed" | "approved" | "rejected" | "failed";
    invoiceStatusCounts?: {
        approved: number;
        rejected: number;
        pending: number;
    };
    vendorData: VendorData
}

interface JobsTableProps {
    jobs: Job[];
    isLoading: boolean;
    onReviewJob: (jobId: string, invoiceId?: number) => void;
    onJobDeleted?: () => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSort: (field: string) => void;
}

export function JobsTable({ jobs, isLoading, onReviewJob, onJobDeleted, sortBy, sortOrder, onSort }: JobsTableProps) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jobId?: string; filename?: string }>({ open: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [invoicesCache, setInvoicesCache] = useState<Record<string, Invoice[]>>({});
    const [loadingInvoices, setLoadingInvoices] = useState<Set<string>>(new Set());

    const handleDeleteClick = (e: React.MouseEvent, jobId: string, filename: string) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, jobId, filename });
    };

    const toggleRowExpansion = async (jobId: string) => {
        const newExpandedRows = new Set(expandedRows);

        if (expandedRows.has(jobId)) {
            newExpandedRows.delete(jobId);
        } else {
            newExpandedRows.add(jobId);

            // Fetch invoices if not already cached
            if (!invoicesCache[jobId]) {
                setLoadingInvoices(prev => new Set(prev).add(jobId));
                try {
                    const response = await client.get(`/api/v1/invoice/invoices?attachmentId=${jobId}`);
                    const invoiceData = response.data?.data?.invoices || response.data?.invoices || [];
                    setInvoicesCache(prev => ({ ...prev, [jobId]: invoiceData }));
                } catch (error) {
                    console.error("Failed to fetch invoices:", error);
                    toast.error("Failed to load invoices");
                } finally {
                    setLoadingInvoices(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(jobId);
                        return newSet;
                    });
                }
            }
        }

        setExpandedRows(newExpandedRows);
    };

    const handleRowClick = (jobId: string, job: Job) => {
        // Don't expand if no invoices or if status is pending/processing
        if (job.invoiceCount === 0 || job.jobStatus === "pending" || job.jobStatus === "processing") {
            return;
        }
        toggleRowExpansion(jobId);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.jobId) return;

        setIsDeleting(true);
        try {
            await client.delete(`/api/v1/email/attachments/${deleteDialog.jobId}`);
            toast.success("Job deleted successfully");
            setDeleteDialog({ open: false });

            // Notify parent to refresh the list
            if (onJobDeleted) {
                onJobDeleted();
            }
        } catch (error) {
            console.error("Failed to delete job:", error);
            toast.error("Failed to delete job");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRegenerate = async (e: React.MouseEvent, jobId: string) => {
        e.stopPropagation();
        setIsRegenerating(jobId);
        try {
            await client.post("/api/v1/upload/regenerate", {
                attachmentId: parseInt(jobId, 10),
            });
            toast.success("Attachment sent to processing queue successfully");
        } catch (error: any) {
            console.error("Failed to regenerate attachment:", error);
            const errorMessage = error?.response?.data?.message || "Failed to regenerate attachment";
            toast.error(errorMessage);
        } finally {
            setIsRegenerating(null);
        }
    };
    const getStatusBadge = (status: "pending" | "processing" | "processed" | "approved" | "rejected" | "failed") => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Pending
                    </Badge>
                );
            case "processing":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        Processing
                    </Badge>
                );
            case "processed":
                return (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        Needs Review
                    </Badge>
                );
            case "approved":
            case "rejected":
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Completed
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Unknown
                    </Badge>
                );
        }
    };

    const getSourceDisplay = (provider?: string) => {
        if (provider === "gmail") return "Gmail";
        if (provider === "outlook") return "Outlook";
        return "—";
    };

    const getEmailDisplay = (provider?: string, receiver?: string) => {
        if (provider === "gmail" || provider === "outlook") {
            return receiver || "—";
        }
        return "—";
    };

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px] max-w-[120px] p-0">
                                <button
                                    onClick={() => onSort("job")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Job
                                    {sortBy === "job" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[180px] p-0">
                                <button
                                    onClick={() => onSort("received")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Received
                                    {sortBy === "received" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[150px] p-0">
                                <button
                                    onClick={() => onSort("vendor")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Vendor
                                    {sortBy === "vendor" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[100px] p-0">
                                <button
                                    onClick={() => onSort("source")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Source
                                    {sortBy === "source" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[200px] p-0">
                                <button
                                    onClick={() => onSort("email")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Email
                                    {sortBy === "email" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[80px] p-0">
                                <button
                                    onClick={() => onSort("invoices")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Invoices
                                    {sortBy === "invoices" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="min-w-[150px]">Invoice Status</TableHead>
                            <TableHead className="min-w-[120px] p-0">
                                <button
                                    onClick={() => onSort("status")}
                                    className="flex items-center gap-1 hover:text-foreground w-full h-full px-4 py-3"
                                >
                                    Status
                                    {sortBy === "status" ? (
                                        sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No jobs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <React.Fragment key={job.id}>
                                    <TableRow
                                        className={`hover:bg-muted/50 ${job.invoiceCount > 0 && job.jobStatus !== "pending" && job.jobStatus !== "processing" ? "cursor-pointer" : "cursor-default"}`}
                                        onClick={() => handleRowClick(job.id, job)}
                                    >
                                        <TableCell className="font-medium w-[120px] max-w-[120px]">
                                            <div className="flex items-center gap-2">
                                                {expandedRows.has(job.id) ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <TooltipProvider delayDuration={300}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="truncate">
                                                                {job.id}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="top"
                                                            className="max-w-[400px] break-words z-50"
                                                            sideOffset={5}
                                                        >
                                                            {job.id}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {new Date(job.created_at).toLocaleDateString("en-US", {
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(job.created_at).toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{job.vendorData ? job?.vendorData?.displayName ?? "-" : "—"}</TableCell>
                                        <TableCell>{getSourceDisplay(job.provider)}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {job.sender || "—"}
                                        </TableCell>
                                        <TableCell>{job.invoiceCount || 0}</TableCell>
                                        <TableCell>
                                            {job.invoiceStatusCounts ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-green-600">✓ {job.invoiceStatusCounts.approved}</span>
                                                    <span className="text-red-600">✗ {job.invoiceStatusCounts.rejected}</span>
                                                    <span className="text-yellow-600">⏳ {job.invoiceStatusCounts.pending}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(job.jobStatus)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider delayDuration={300}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => onReviewJob(job.id)}
                                                                    disabled={job.invoiceCount === 0 || job.jobStatus === "processing" || job.jobStatus === "pending"}
                                                                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Open Job
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        {(job.jobStatus === "processing" || job.jobStatus === "pending") && (
                                                            <TooltipContent side="top" className="z-50">
                                                                Job is still {job.jobStatus}. Please wait for it to complete.
                                                            </TooltipContent>
                                                        )}
                                                        {job.invoiceCount === 0 && job.jobStatus !== "processing" && job.jobStatus !== "pending" && (
                                                            <TooltipContent side="top" className="z-50">
                                                                No invoices available for this job
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleRegenerate(e, job.id)}
                                                            disabled={isRegenerating === job.id}
                                                            className="cursor-pointer"
                                                        >
                                                            {isRegenerating === job.id ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Regenerating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                                                    Regenerate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleDeleteClick(e, job.id, job.filename)}
                                                            disabled={isDeleting}
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded Row - Invoice List */}
                                    {expandedRows.has(job.id) && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                                                <div className="p-4">
                                                    {loadingInvoices.has(job.id) ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                                                            <span className="text-sm text-muted-foreground">Loading invoices...</span>
                                                        </div>
                                                    ) : (invoicesCache[job.id]?.length ?? 0) > 0 ? (
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                                <FileText className="h-4 w-4" />
                                                                Invoices ({invoicesCache[job.id]?.length || 0})
                                                            </h4>
                                                            <div className="grid gap-2">
                                                                {invoicesCache[job.id]?.map((invoice) => (
                                                                    <div
                                                                        key={invoice.id}
                                                                        className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onReviewJob(job.id, invoice.id);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-medium truncate">
                                                                                        {invoice.invoiceNumber || `Invoice #${invoice.id}`}
                                                                                    </span>
                                                                                    {invoice.status && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className={
                                                                                                invoice.status === "approved"
                                                                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                                                    : invoice.status === "rejected"
                                                                                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                                                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                                                            }
                                                                                        >
                                                                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                                    {invoice.vendorData && (
                                                                                        <span className="truncate">{invoice.vendorData ? invoice?.vendorData?.displayName ?? "" : ""}</span>
                                                                                    )}
                                                                                    {invoice.totalAmount && (
                                                                                        <span className="flex-shrink-0">${invoice.totalAmount}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="flex-shrink-0"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onReviewJob(job.id, invoice.id);
                                                                            }}
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 text-sm text-muted-foreground">
                                                            No invoices found for this job
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this job? This will also delete all associated invoices and cannot be undone.
                            {deleteDialog.filename && (
                                <div className="mt-2 text-sm font-medium">
                                    <strong>Job:</strong> {deleteDialog.filename}
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
