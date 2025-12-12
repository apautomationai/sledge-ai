"use client";

import { useState, useEffect, useCallback } from "react";
import { client } from "@/lib/axios-client";
import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";

export interface Job {
    id: string;
    filename: string;
    sender: string;
    receiver: string;
    provider?: string;
    created_at: string;
    invoiceCount: number;
    jobStatus: "pending" | "processing" | "processed" | "approved" | "rejected" | "failed";
    vendorName?: string | null;
    invoiceStatusCounts?: {
        approved: number;
        rejected: number;
        pending: number;
    };
}

interface JobsApiResponse {
    jobs: Job[];
    statusCounts: {
        all: number;
        pending: number;
        processing: number;
        processed: number;
        approved: number;
        rejected: number;
        failed: number;
    };
    pagination: {
        totalJobs: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface UseJobsParams {
    page: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
}

export function useJobs({ page, status = "all", sortBy = "received", sortOrder = "desc", search = "" }: UseJobsParams) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [statusCounts, setStatusCounts] = useState({
        all: 0,
        pending: 0,
        processing: 0,
        processed: 0,
        approved: 0,
        failed: 0,
    });
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobs = useCallback(async () => {
        try {
            setIsLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                status,
                sortBy,
                sortOrder,
            });

            if (search) {
                params.append("search", search);
            }

            const response = await client.get(
                `api/v1/jobs?${params.toString()}`
            );

            console.log("Jobs API Response:", response);

            // Handle the response structure: { status: "success", data: { jobs: [], statusCounts: {}, pagination: {} } }
            if (response.data?.data?.jobs) {
                setJobs(response.data.data.jobs);
                setStatusCounts(response.data.data.statusCounts || statusCounts);
                setTotalPages(response.data.data.pagination?.totalPages || 1);
            } else if (response.data?.jobs) {
                // Fallback if structure is different
                setJobs(response.data.jobs);
                setStatusCounts(response.data.statusCounts || statusCounts);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                console.warn("Unexpected response structure:", response.data);
                setJobs([]);
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
            setJobs([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, status, sortBy, sortOrder, search]);

    // Initial fetch
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Set up real-time WebSocket connection
    const { joinInvoiceList, leaveInvoiceList } = useRealtimeInvoices({
        onRefreshNeeded: () => {
            console.log("🔄 WebSocket: Refresh needed - fetching jobs");
            fetchJobs();
        },
        onInvoiceCreated: (invoiceId) => {
            console.log("✅ WebSocket: Invoice created:", invoiceId, "- fetching jobs");
            fetchJobs();
        },
        onInvoiceUpdated: (invoiceId) => {
            console.log("📝 WebSocket: Invoice updated:", invoiceId, "- fetching jobs");
            fetchJobs();
        },
        onInvoiceStatusUpdated: (invoiceId, status) => {
            console.log("🔔 WebSocket: Invoice status updated:", invoiceId, status, "- fetching jobs");
            fetchJobs();
        },
        onAttachmentStatusUpdated: (attachmentId, status) => {
            console.log("📎 WebSocket: Attachment status updated:", attachmentId, status, "- fetching jobs");
            if (attachmentId) {
                // Update the specific job's status in place instead of refetching all jobs
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job.id === String(attachmentId)
                            ? { ...job, jobStatus: status as Job["jobStatus"] }
                            : job
                    )
                );
            } else {
                // Fallback to refetching if attachmentId is not provided
                fetchJobs();
            }
        },
        enableToasts: false,
        autoConnect: true,
    });

    // Join invoice list room when component mounts
    useEffect(() => {
        console.log("🔌 Jobs: Joining invoice list room");
        joinInvoiceList();
        return () => {
            console.log("🔌 Jobs: Leaving invoice list room");
            leaveInvoiceList();
        };
    }, [joinInvoiceList, leaveInvoiceList]);

    return {
        jobs,
        statusCounts,
        totalPages,
        isLoading,
        refetch: fetchJobs,
    };
}
