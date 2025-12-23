"use client";

import { useEffect } from "react";
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

  // Set up real-time WebSocket connection
  const { joinInvoiceList, leaveInvoiceList } = useRealtimeInvoices({
    onRefreshNeeded: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onInvoiceCreated: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onInvoiceUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onInvoiceStatusUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onAttachmentStatusUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
