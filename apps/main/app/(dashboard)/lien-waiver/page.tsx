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

// Types
interface LienWaiver {
    id: number;
    lienWaiverNumber: string;
    type: "Conditional" | "Unconditional";
    typeDescription: string;
    throughDate: string;
    vendorName: string;
    vendorSubtitle?: string;
    vendorInitial: string;
    status: "Requested" | "Pending Signature" | "Completed";
    sentDate?: string;
    pendingSince?: string;
}

type StatusFilter = "all" | "requested" | "pending" | "completed";

const ITEMS_PER_PAGE = 10;

// Mock data for demonstration
const mockLienWaivers: LienWaiver[] = [
    {
        id: 1,
        lienWaiverNumber: "LW-2025-0042",
        type: "Conditional",
        typeDescription: "Thruprds",
        throughDate: "2025-05-31",
        vendorName: "Canfield",
        vendorSubtitle: "Electrician",
        vendorInitial: "C",
        status: "Requested",
        sentDate: "2025-05-04",
    },
    {
        id: 2,
        lienWaiverNumber: "LW-2025-0039",
        type: "Conditional",
        typeDescription: "Thru QP35",
        throughDate: "2025-05-31",
        vendorName: "Summit",
        vendorSubtitle: "Concrete",
        vendorInitial: "S",
        status: "Pending Signature",
        pendingSince: "2025-04-30",
    },
    {
        id: 3,
        lienWaiverNumber: "LW-2025-0028",
        type: "Conditional",
        typeDescription: "Thru QP31",
        throughDate: "2025-04-21",
        vendorName: "Ace",
        vendorSubtitle: "Plumbing",
        vendorInitial: "A",
        status: "Completed",
        sentDate: "2025-04-12",
    },
    {
        id: 4,
        lienWaiverNumber: "LW-2025-0015",
        type: "Conditional",
        typeDescription: "Completer",
        throughDate: "2025-03-31",
        vendorName: "Westside",
        vendorSubtitle: "Heating",
        vendorInitial: "W",
        status: "Completed",
        sentDate: "2025-03-26",
    },
    {
        id: 5,
        lienWaiverNumber: "LW-2025-0008",
        type: "Conditional",
        typeDescription: "Progress",
        throughDate: "2025-03-15",
        vendorName: "GL Drywall",
        vendorInitial: "D",
        status: "Completed",
        sentDate: "2025-03-10",
    },
];

export default function LienWaiversPage() {
    const [lienWaivers, setLienWaivers] = useState<LienWaiver[]>([]);
    const [filteredWaivers, setFilteredWaivers] = useState<LienWaiver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch lien waivers
    useEffect(() => {
        fetchLienWaivers();
    }, []);

    // Filter lien waivers when filters change
    useEffect(() => {
        filterLienWaivers();
    }, [lienWaivers, searchQuery, statusFilter, dateRange]);

    const fetchLienWaivers = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await client.get("/api/v1/lien-waivers");
            // setLienWaivers(response.data.lienWaivers);

            // Using mock data for now
            await new Promise((resolve) => setTimeout(resolve, 500));
            setLienWaivers(mockLienWaivers);
        } catch (error: any) {
            toast.error("Failed to load lien waivers");
            console.error("Error fetching lien waivers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterLienWaivers = () => {
        let filtered = [...lienWaivers];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (lw) =>
                    lw.lienWaiverNumber.toLowerCase().includes(query) ||
                    lw.vendorName.toLowerCase().includes(query) ||
                    lw.vendorSubtitle?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            const statusMap: Record<string, string> = {
                requested: "Requested",
                pending: "Pending Signature",
                completed: "Completed",
            };
            filtered = filtered.filter((lw) => lw.status === statusMap[statusFilter]);
        }

        // Date range filter
        if (dateRange.from || dateRange.to) {
            filtered = filtered.filter((lw) => {
                const date = new Date(lw.throughDate);
                if (dateRange.from && date < dateRange.from) return false;
                if (dateRange.to && date > dateRange.to) return false;
                return true;
            });
        }

        setFilteredWaivers(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    };

    const paginatedWaivers = filteredWaivers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleUpload = () => {
        // TODO: Implement upload functionality
        toast.info("Upload functionality coming soon");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lien Waivers</h1>
                    <p className="text-muted-foreground mt-1">
                        View all lien waivers across all projects.
                    </p>
                </div>

            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
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
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
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
                                setDateRange({ from: range?.from, to: range?.to })
                            }
                            numberOfMonths={2}
                        />
                        {(dateRange.from || dateRange.to) && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDateRange({})}
                                    className="w-full"
                                >
                                    Clear dates
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Table */}
            <LienWaiverTable lienWaivers={paginatedWaivers} isLoading={isLoading} />

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredWaivers.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

