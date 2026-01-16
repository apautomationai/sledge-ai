"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/axios-client";
import { JobsHeader } from "@/components/jobs/jobs-header";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { JobsTable } from "@/components/jobs/jobs-table";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { CreateJobDialog } from "@/components/jobs/create-job-dialog";
import { useJobs } from "@/hooks/use-jobs";

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("received");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs with filters applied on backend
  const { jobs, statusCounts, totalPages, isLoading, refetch } = useJobs({
    page: currentPage,
    status: statusFilter,
    sortBy,
    sortOrder,
    search: debouncedSearch,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateJob = () => {
    setIsCreateDialogOpen(true);
  };

  const handleJobCreated = () => {
    // Refresh the jobs list after creating a new job
    refetch();
  };

  const handleSyncEmails = async () => {
    setIsSyncing(true);
    try {
      await Promise.all(
        ["/api/v1/email/gmail/my", "/api/v1/email/outlook/my"].map((endpoint) =>
          client.get(endpoint)
        )
      );
      toast.success("Emails synced successfully");
      refetch();
      router.refresh();
    } catch (error) {
      toast.error("Failed to sync emails");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReviewJob = (jobId: string, invoiceId?: number) => {
    if (invoiceId) {
      router.push(`/bills/${jobId}?billId=${invoiceId}`);
    } else {
      router.push(`/bills/${jobId}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:gap-4">
        <JobsHeader />
        <JobsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCreateJob={handleCreateJob}
          onSyncEmails={handleSyncEmails}
          isSyncing={isSyncing}
          statusCounts={statusCounts}
        />
      </div>

      <JobsTable
        jobs={jobs}
        isLoading={isLoading}
        onReviewJob={handleReviewJob}
        onJobDeleted={refetch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(field) => {
          if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortBy(field);
            setSortOrder("asc");
          }
        }}
      />

      <JobsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <CreateJobDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}
