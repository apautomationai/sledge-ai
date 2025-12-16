"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@workspace/ui/components/input";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { VendorsTable, Pagination, type Vendor } from "@/components/vendors";

const ITEMS_PER_PAGE = 10;

const DUMMY_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "Acme Construction",
    projectCount: 5,
    invoiceCount: 12,
    lienWaiverCount: 6,
  },
  {
    id: 2,
    name: "BuildCorp",
    projectCount: 6,
    invoiceCount: 8,
    lienWaiverCount: 2,
  },
  {
    id: 3,
    name: "Stoneworks",
    projectCount: 4,
    invoiceCount: 0,
    lienWaiverCount: 0,
  },
  {
    id: 4,
    name: "ProElectric",
    projectCount: 8,
    invoiceCount: 14,
    lienWaiverCount: 0,
  },
  {
    id: 5,
    name: "SupplyPro",
    projectCount: 5,
    invoiceCount: 5,
    lienWaiverCount: 0,
  },
  {
    id: 6,
    name: "MetroEnergy",
    projectCount: 6,
    invoiceCount: 9,
    lienWaiverCount: 0,
  },
];


export default function VendorsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Filter, sort, and paginate vendors
    const { paginatedVendors, totalPages, totalVendors } = useMemo(() => {
        // Filter by search
        let filtered = DUMMY_VENDORS.filter((vendor) =>
            vendor.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

        // Sort
        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number = a[sortBy as keyof Vendor];
            let bValue: string | number = b[sortBy as keyof Vendor];

            if (typeof aValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Calculate pagination
        const total = filtered.length;
        const pages = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        return {
            paginatedVendors: paginated,
            totalPages: pages,
            totalVendors: total,
        };
    }, [debouncedSearch, sortBy, sortOrder, currentPage]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const sortOptions = [
        { label: "Name", value: "name" },
        { label: "Projects", value: "projectCount" },
        { label: "Invoices", value: "invoiceCount" },
        { label: "Lien Waivers", value: "lienWaiverCount" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
                <p className="text-muted-foreground">
                    Manage all vendors across your projects in one place.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[150px]">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                            {sortOrder === "asc" ? " (A-Z)" : " (Z-A)"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {sortOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleSort(option.value)}
                                className="cursor-pointer"
                            >
                                {option.label}
                                {sortBy === option.value && (
                                    <span className="ml-2 text-muted-foreground">
                                        ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                                    </span>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <VendorsTable
                vendors={paginatedVendors}
                isLoading={isLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
            />

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalVendors}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
