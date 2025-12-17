"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { VendorsTable, Pagination, VendorsFilter, type Vendor } from "@/components/vendors";
import client from "@/lib/axios-client";
import { syncQuickBooksData } from "@/lib/services/quickbooks.service";

const ITEMS_PER_PAGE = 10;

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch vendors from API
    useEffect(() => {
        fetchVendors();
    }, [currentPage, debouncedSearch, sortBy, sortOrder]);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response: any = await client.get("/api/v1/vendors", {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                },
            });

            console.log("Vendors API Response:", response);

            if (response.status === "success") {
                const fetchedVendors = response.data.vendors.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    projectCount: v.projectCount || 0,
                    invoiceCount: v.invoiceCount || 0,
                    lienWaiverCount: v.lienWaiverCount || 0,
                }));

                setVendors(fetchedVendors);
                setTotalPages(response.data.pagination.totalPages);
                setTotalVendors(response.data.pagination.total);
            }
        } catch (error: any) {
            toast.error("Failed to load vendors");
            console.error("Error fetching vendors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const syncVendors = async () => {
        setIsSyncing(true);
        try {
            await syncQuickBooksData();
            toast.success("Sync completed successfully");

            // Refresh vendor list after sync
            fetchVendors();
        } catch (error: any) {
            toast.error("Failed to sync vendors");
            console.error("Error syncing vendors:", error);
        } finally {
            console.log("Finally block reached");
            setIsSyncing(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
        setCurrentPage(1); // Reset to first page on sort change
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
                    <p className="text-muted-foreground">
                        Manage all vendors across your projects in one place.
                    </p>
                </div>
                <Button onClick={syncVendors} disabled={isSyncing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : "Sync"}
                </Button>
            </div>

            {/* Filters */}
            <VendorsFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                sortOptions={sortOptions}
            />

            {/* Table */}
            <VendorsTable
                vendors={vendors}
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