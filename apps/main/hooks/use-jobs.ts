"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/axios-client";
import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";

export interface VendorData {
  id: number;
  displayName: string | null;
  companyName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  billAddrLine1: string | null;
  billAddrCity: string | null;
  billAddrState: string | null;
  billAddrPostalCode: string | null;
  active: boolean | null;
  quickbooksId: string;
}

export interface Job {
  id: string;
  filename: string;
  sender: string;
  receiver: string;
  provider?: string;
  created_at: string;
  invoiceCount: number;
  jobStatus:
  | "pending"
  | "processing"
  | "processed"
  | "approved"
  | "rejected"
  | "failed";
  vendorData?: VendorData | null;
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

const defaultStatusCounts = {
  all: 0,
  pending: 0,
  processing: 0,
  processed: 0,
  approved: 0,
  rejected: 0,
  failed: 0,
};

async function fetchJobs(params: UseJobsParams): Promise<JobsApiResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: "10",
    status: params.status || "all",
    sortBy: params.sortBy || "received",
    sortOrder: params.sortOrder || "desc",
  });

  if (params.search) {
    searchParams.append("search", params.search);
  }

  const response = await client.get(`api/v1/jobs?${searchParams.toString()}`);

  // Handle the response structure
  if (response.data?.data?.jobs) {
    return response.data.data;
  } else if (response.data?.jobs) {
    return response.data;
  }

  return {
    jobs: [],
    statusCounts: defaultStatusCounts,
    pagination: { totalJobs: 0, page: 1, limit: 10, totalPages: 1 },
  };
}

export function useJobs({
  page,
  status = "all",
  sortBy = "received",
  sortOrder = "desc",
  search = "",
}: UseJobsParams) {
  const queryClient = useQueryClient();

  const queryKey = ["jobs", { page, status, sortBy, sortOrder, search }];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchJobs({ page, status, sortBy, sortOrder, search }),
  });

  // Debounce mechanism to prevent duplicate updates
  const lastUpdateRef = useRef<{ [jobId: string]: number }>({});

  // Helper function to remove job from cache
  const removeJobFromCache = useCallback((jobId: string) => {
    const updateCacheData = (oldData: JobsApiResponse | undefined): JobsApiResponse | undefined => {
      if (!oldData || !oldData.jobs.some(job => String(job.id) === String(jobId))) {
        return oldData;
      }

      const filteredJobs = oldData.jobs.filter(job => String(job.id) !== String(jobId));
      const statusCounts = {
        all: filteredJobs.length,
        pending: filteredJobs.filter(j => j.jobStatus === "pending").length,
        processing: filteredJobs.filter(j => j.jobStatus === "processing").length,
        processed: filteredJobs.filter(j => j.jobStatus === "processed").length,
        approved: filteredJobs.filter(j => j.jobStatus === "approved" || j.jobStatus === "rejected").length,
        rejected: 0,
        failed: filteredJobs.filter(j => j.jobStatus === "failed").length,
      };
      const updatedPagination = {
        ...oldData.pagination,
        totalJobs: Math.max(0, oldData.pagination.totalJobs - 1),
        totalPages: Math.ceil(Math.max(0, oldData.pagination.totalJobs - 1) / oldData.pagination.limit),
      };

      return { ...oldData, jobs: filteredJobs, statusCounts, pagination: updatedPagination };
    };
    
    queryClient.setQueriesData({ queryKey: ["jobs"] }, updateCacheData);
    queryClient.setQueryData(queryKey, updateCacheData);
  }, [queryClient, queryKey]);

  // Helper function to update job in cache
  const updateJobInCache = (jobId: string, updates: Partial<Job>) => {
    // Debounce: ignore updates that happen within 100ms of the last update for the same job
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current[jobId] || 0;
    if (now - lastUpdate < 100) {
      return;
    }
    lastUpdateRef.current[jobId] = now;

    queryClient.setQueriesData(
      { queryKey: ["jobs"] },
      (oldData: JobsApiResponse | undefined) => {
        if (!oldData) {
          return oldData;
        }

        const jobIndex = oldData.jobs.findIndex(job => String(job.id) === String(jobId));
        if (jobIndex === -1) {
          return oldData;
        }

        const updatedJobs = oldData.jobs.map(job =>
          String(job.id) === String(jobId) ? { ...job, ...updates } : job
        );

        // Update status counts based on the new job statuses
        const statusCounts = {
          all: updatedJobs.length,
          pending: updatedJobs.filter(j => j.jobStatus === "pending").length,
          processing: updatedJobs.filter(j => j.jobStatus === "processing").length,
          processed: updatedJobs.filter(j => j.jobStatus === "processed").length,
          approved: updatedJobs.filter(j => j.jobStatus === "approved" || j.jobStatus === "rejected").length,
          rejected: 0, // Combined with approved
          failed: updatedJobs.filter(j => j.jobStatus === "failed").length,
        };

        return {
          ...oldData,
          jobs: updatedJobs,
          statusCounts,
        };
      }
    );
  };

  // Set up real-time WebSocket connection
  const { joinInvoiceList, leaveInvoiceList } = useRealtimeInvoices({
    onRefreshNeeded: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onInvoiceCreated: () => {
      // New invoice created - this might affect job status, but attachment status will handle it
    },
    onInvoiceUpdated: () => {
      // Invoice updated - this might affect job status, but attachment status will handle it
    },
    onInvoiceStatusUpdated: (invoiceId: number, newStatus: string) => {
      // Invoice status changed - this might affect job status
      // We'll let the job status update event handle this instead of calling API
    },
    onAttachmentStatusUpdated: (attachmentId: number, newStatus: string, attachmentData?: any) => {
      // Attachment status updated - update job with full data if available
      const jobId = attachmentId.toString();
      
      if (newStatus === "skipped") {
        removeJobFromCache(jobId);
        return;
      }

      let jobStatus: Job["jobStatus"] = "pending";

      switch (newStatus) {
        case "pending":
          jobStatus = "pending";
          break;
        case "processing":
          jobStatus = "processing";
          break;
        case "failed":
          jobStatus = "failed";
          break;
        case "success":
        case "completed":
          jobStatus = "processed"; // Will be refined by invoice statuses
          break;
        default:
          jobStatus = "processed";
      }

      // Create update object with status and any additional attachment data
      const updates: Partial<Job> = { jobStatus };

      // If we have full attachment data, map relevant fields to job fields
      if (attachmentData) {
        // Map attachment fields to job fields as needed (only fields that exist in Job interface)
        if (attachmentData.filename) updates.filename = attachmentData.filename;
        if (attachmentData.sender) updates.sender = attachmentData.sender;
        if (attachmentData.receiver) updates.receiver = attachmentData.receiver;
        if (attachmentData.provider) updates.provider = attachmentData.provider;
        if (attachmentData.created_at) updates.created_at = attachmentData.created_at;
        // Note: Only updating fields that exist in the Job interface
      }

      updateJobInCache(jobId, updates);
    },
    onJobStatusUpdated: (jobId: string, newStatus: string, jobData?: any) => {
      // Direct job status update - use full job data if available
      const updates: Partial<Job> = { jobStatus: newStatus as Job["jobStatus"] };

      // If we have full job data, use it to update all fields
      if (jobData) {
        Object.assign(updates, jobData);
      }

      updateJobInCache(jobId, updates);
    },
    enableToasts: false,
    autoConnect: true,
  });

  // Join invoice list room when component mounts
  useEffect(() => {
    joinInvoiceList();
    return () => {
      leaveInvoiceList();
    };
  }, [joinInvoiceList, leaveInvoiceList]);

  return {
    jobs: query.data?.jobs || [],
    statusCounts: query.data?.statusCounts || defaultStatusCounts,
    totalPages: query.data?.pagination?.totalPages || 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
