"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardMetrics } from "@/lib/types";
import StatsCards from "./stats-cards";
import DateRangeSelector, { DateRangeType } from "./date-range-selector";
import InvoiceStatusChart from "./invoice-status-chart";
import InvoiceTrendChart from "./invoice-trend-chart";
import { Button } from "@workspace/ui/components/button";
import { FileText, Settings, Plug } from "lucide-react";

interface DashboardDataViewProps {
  metrics: DashboardMetrics;
  onDateRangeChange: (dateRange: DateRangeType) => void;
  isLoading: boolean;
}

export default function DashboardDataView({
  metrics,
  onDateRangeChange,
  isLoading,
}: DashboardDataViewProps) {
  const [dateRange, setDateRange] = useState<DateRangeType>("monthly");

  const handleDateRangeChange = (newRange: DateRangeType) => {
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <div className="flex flex-col overflow-x-hidden">
      <header className="flex items-center justify-between py-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your accounts payable workflow and pending invoices.
          </p>
        </div>
        <DateRangeSelector
          selectedRange={dateRange}
          onRangeChange={handleDateRangeChange}
        />
      </header>

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/jobs">
            <Button variant="default" className="gap-2">
              <FileText className="h-4 w-4" />
              Review Invoices
            </Button>
          </Link>
          <Link href="/integrations">
            <Button variant="default" className="gap-2">
              <Plug className="h-4 w-4" />
              Change Integrations
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="default" className="gap-2">
              <Settings className="h-4 w-4" />
              Update Settings
            </Button>
          </Link>
        </div>

        <StatsCards metrics={metrics} dateRange={dateRange} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <InvoiceStatusChart metrics={metrics} dateRange={dateRange} />
          <InvoiceTrendChart dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
}