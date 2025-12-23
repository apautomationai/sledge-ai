"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { cn } from "@workspace/ui/lib/utils";
import {
    Search,
    CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import client from "@/lib/axios-client";
import { LienWaiverTable, Pagination } from "@/components/lien-waiver";

// Types matching API response
interface LienWaiver {
    id: number;
    projectId: string;
    projectName: string | null;
    projectAddress: string | null;
    waiverType: string;
    billingCycle: number;
    throughDate: string;
    vendorName: string;
    vendorEmail: string | null;
    customerName: string | null;
    amount: string;
    isSigned: boolean;
    signedAt: string | null;
    signedFileUrl: string | null;
    createdAt: string;
    // Computed fields for display
    lienWaiverNumber: string;
    type: "Conditional" | "Unconditional";
    typeDescription: string;
    vendorSubtitle?: string;
    vendorInitial: string;
    status: "Requested" | "Pending Signature" | "Completed";
    sentDate?: string;
    pendingSince?: string;
}

type StatusFilter = "" | "signed" | "pending";

const ITEMS_PER_PAGE = 10;

export default function LienWaiversPage() {
    const [lienWaivers, setLienWaivers] = useState<LienWaiver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch lien waivers when filters change
    useEffect(() => {
        fetchLienWaivers();
    }, [currentPage, debouncedSearch, statusFilter, dateRange]);

    const fetchLienWaivers = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            if (statusFilter !== "") {
                params.status = statusFilter;
            }

            if (dateRange.from) {
                params.startDate = format(dateRange.from, "yyyy-MM-dd");
            }

            if (dateRange.to) {
                params.endDate = format(dateRange.to, "yyyy-MM-dd");
            }

            const response: any = await client.get("/api/v1/lien-waivers", { params });

            if (response.success && response.data) {
                // Transform API response to match display format
                const transformedWaivers = response.data.lienWaivers.map((lw: any) => ({
                    ...lw,
                    lienWaiverNumber: `LW-${lw.id.toString().padStart(4, '0')}`,
                    type: lw.waiverType === 'conditional' ? 'Conditional' : 'Unconditional',
                    typeDescription: `Billing Cycle ${lw.billingCycle}`,
                    vendorInitial: lw.vendorName?.charAt(0).toUpperCase() || 'V',
                    vendorSubtitle: lw.projectName || undefined,
                    status: lw.isSigned ? 'Completed' : 'Pending Signature',
                    sentDate: lw.createdAt,
                    pendingSince: !lw.isSigned ? lw.createdAt : undefined,
                }));

                setLienWaivers(transformedWaivers);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.total);
            }
        } catch (error: any) {
            toast.error("Failed to load lien waivers");
            console.error("Error fetching lien waivers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value as StatusFilter);
        setCurrentPage(1);
    };

    const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
        setDateRange(range);
        setCurrentPage(1);
    };

    const handleClearDates = () => {
        setDateRange({});
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lien Waivers</h1>
                    <p className="text-muted-foreground mt-1">
                        View all lien waivers across all projects.
                    </p>
                </div>

            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 flex-shrink-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search lien waivers, vendors, projects, invoices"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card border-border"
                    />
                </div>

                {/* Status Filter */}
                <Select
                    value={statusFilter}
                    onValueChange={handleStatusChange}
                >
                    <SelectTrigger className="w-[140px] bg-card border-border">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date Range Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[200px] justify-start text-left font-normal bg-card border-border",
                                !dateRange.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "MMM d")} -{" "}
                                        {format(dateRange.to, "MMM d, yyyy")}
                                    </>
                                ) : (
                                    format(dateRange.from, "MMM d, yyyy")
                                )
                            ) : (
                                "Date Range"
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="range"
                            selected={{ from: dateRange.from, to: dateRange.to }}
                            onSelect={(range) =>
                                handleDateRangeChange({ from: range?.from, to: range?.to })
                            }
                            numberOfMonths={2}
                        />
                        {(dateRange.from || dateRange.to) && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearDates}
                                    className="w-full"
                                >
                                    Clear dates
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Table - Scrollable area */}
            <div className="flex-1 min-h-0">
                <LienWaiverTable lienWaivers={lienWaivers} isLoading={isLoading} />
            </div>

            {/* Pagination - Fixed at bottom */}
            <div className="flex-shrink-0 pt-4 border-t mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

