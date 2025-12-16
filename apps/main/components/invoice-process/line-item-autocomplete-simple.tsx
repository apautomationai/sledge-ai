"use client";

import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { QuickBooksAccount, QuickBooksItem, QuickBooksCustomer } from "@/lib/services/quickbooks.service";

interface AutocompleteProps<T extends QuickBooksAccount | QuickBooksItem | QuickBooksCustomer> {
    items: T[];
    value: string | null;
    onSelect: (id: string, item?: T) => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    getDisplayName: (item: T) => string;
}

export function LineItemAutocomplete<T extends QuickBooksAccount | QuickBooksItem | QuickBooksCustomer>({
    items,
    value,
    onSelect,
    placeholder = "Search...",
    isLoading = false,
    disabled = false,
    getDisplayName,
}: AutocompleteProps<T>) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const selectedItem = useMemo(() => {
        if (!value) return null;
        const found = items.find((item) => item.Id === value) || null;
        return found;
    }, [items, value]);

    const filteredItems = useMemo(() => {
        if (!searchValue.trim()) {
            return items;
        }
        const searchTerms = searchValue.toLowerCase().trim().split(/\s+/);
        return items.filter((item) => {
            const displayName = getDisplayName(item).toLowerCase();
            return searchTerms.every(term => displayName.includes(term));
        });
    }, [items, searchValue, getDisplayName]);

    const handleSelect = (item: T) => {
        onSelect(item.Id, item);
        setOpen(false);
        setSearchValue("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9"
                    disabled={disabled || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                        </>
                    ) : selectedItem ? (
                        <span className="truncate">{getDisplayName(selectedItem)}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredItems[0]) {
                                    handleSelect(filteredItems[0]);
                                }
                            }}
                        />
                    </div>

                    {/* Items List */}
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Loading...</span>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <div
                                    key={item.Id}
                                    className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                                    onClick={() => handleSelect(item)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.Id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{getDisplayName(item)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                {searchValue ? "No results found." : "No items available."}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}