"use client";

import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { DBQuickBooksAccount, DBQuickBooksProduct, QuickBooksCustomer } from "@/lib/services/quickbooks.service";

interface AutocompleteProps<T extends DBQuickBooksAccount | DBQuickBooksProduct | QuickBooksCustomer> {
    items: T[];
    value: string | null;
    onSelect: (id: string, item?: T) => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    getDisplayName: (item: T) => string;
}

export function LineItemAutocomplete<T extends DBQuickBooksAccount | DBQuickBooksProduct | QuickBooksCustomer>({
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
        if (!value || value === 'undefined' || value === 'null') return null;

        // For accounts and products, match by quickbooks_id (saved value)
        // For customers, match by quickbooksId field
        const found = items.find((item) => {
            if ('quickbooksId' in item) {
                // Database items (customers) - match by quickbooksId
                return item.quickbooksId === value;
            } else {
                // Database items (accounts, products) - match by quickbooks_id field
                return (item as any).quickbooksId === value;
            }
        }) || null;

        return found;
    }, [items, value, getDisplayName]);

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
        // For UI state management, we pass the database ID
        // The parent component will extract quickbooks_id for saving to database
        const itemId = String((item as any).id);
        onSelect(itemId, item);
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
                            filteredItems.map((item) => {
                                const itemId = String((item as any).id);
                                // For selection highlighting, we need to check if this item's quickbooks_id matches the saved value
                                const isSelected = 'quickbooksId' in item
                                    ? item.quickbooksId === value
                                    : (item as any).quickbooksId === value;

                                return (
                                    <div
                                        key={itemId}
                                        className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                                        onClick={() => handleSelect(item)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{getDisplayName(item)}</span>
                                    </div>
                                );
                            })
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