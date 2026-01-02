"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardMetrics } from "@/lib/types";
import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";
import DashboardDataView from "./dashboard-data-view";
import ErrorBanner from "./error-banner";
import client from "@/lib/axios-client";
import { DateRangeType } from "./date-range-selector";

interface DashboardClientProps {
  initialMetrics: DashboardMetrics;
  integrationError: string | null;
}

export default function DashboardClient({
  initialMetrics,
  integrationError,
}: DashboardClientProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  // Show success toast if payment was completed
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success("Payment setup complete!", {
        description: "Your subscription is now active. Welcome to the dashboard!",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // Function to fetch dashboard data based on date range
  const fetchDashboardData = useCallback(async (dateRange: DateRangeType) => {
    setIsLoading(true);
    try {
      const response: any = await client.get(
        `api/v1/invoice/dashboard?dateRange=${dateRange}`
      );
      if (response?.data?.metrics) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up real-time WebSocket connection for dashboard
  // Function to refresh dashboard data
  const refreshDashboardData = useCallback(() => {
    window.location.reload();
  }, []);

  const { joinDashboard, leaveDashboard } = useRealtimeInvoices({
    onRefreshNeeded: refreshDashboardData,
    enableToasts: true,
    autoConnect: true,
  });

  // Join dashboard room when component mounts, leave when unmounts
  useEffect(() => {
    joinDashboard();

    return () => {
      leaveDashboard();
    };
  }, [joinDashboard, leaveDashboard]);

  return (
    <div>
      {integrationError && (
        <ErrorBanner message={integrationError} onClose={() => { }} />
      )}
      <DashboardDataView
        metrics={metrics}
        onDateRangeChange={fetchDashboardData}
        isLoading={isLoading}
      />
    </div>
  );
}
