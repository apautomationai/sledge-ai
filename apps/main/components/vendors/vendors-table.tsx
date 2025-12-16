"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface Vendor {
    id: number;
    name: string;
    projectCount: number;
    invoiceCount: number;
    lienWaiverCount: number;
}

interface VendorsTableProps {
    vendors: Vendor[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSort: (field: string) => void;
}

export function VendorsTable({ vendors, isLoading, sortBy, sortOrder, onSort }: VendorsTableProps) {
    const router = useRouter();

    const handleRowClick = (vendorId: number) => {
        router.push(`/vendors/${vendorId}`);
    };

    const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <TableHead
            className={cn(
                "cursor-pointer hover:bg-muted/50 transition-colors select-none",
                field !== "name" && "text-center"
            )}
            onClick={() => onSort(field)}
        >
            <div className={cn("flex items-center gap-1", field !== "name" && "justify-center")}>
                {children}
                <ArrowUpDown
                    className={cn(
                        "h-4 w-4 transition-colors",
                        sortBy === field ? "text-primary" : "text-muted-foreground/50"
                    )}
                />
            </div>
        </TableHead>
    );

    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[40%]">Vendor</TableHead>
                            <TableHead className="text-center">Projects</TableHead>
                            <TableHead className="text-center">Invoices</TableHead>
                            <TableHead className="text-center">Lien Waivers</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <SortableHeader field="name">Vendor</SortableHeader>
                        <SortableHeader field="projectCount">Projects</SortableHeader>
                        <SortableHeader field="invoiceCount">Invoices</SortableHeader>
                        <SortableHeader field="lienWaiverCount">Lien Waivers</SortableHeader>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                <p className="text-muted-foreground">No vendors found</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        vendors.map((vendor) => (
                            <TableRow
                                key={vendor.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(vendor.id)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                            {vendor.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{vendor.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
                                        {vendor.projectCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                                        {vendor.invoiceCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                                        {vendor.lienWaiverCount}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
