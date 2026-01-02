"use client";

import React from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search, ArrowUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

export interface SortOption {
    label: string;
    value: string;
}

interface VendorsFilterProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSort: (field: string) => void;
    sortOptions: SortOption[];
    searchPlaceholder?: string;
}

export function VendorsFilter({
    searchQuery,
    onSearchChange,
    sortBy,
    sortOrder,
    onSort,
    sortOptions,
    searchPlaceholder = "Search vendors...",
}: VendorsFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
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
                <DropdownMenuContent align="end" className="bg-popover z-50">
                    {sortOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onSort(option.value)}
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
    );
}
