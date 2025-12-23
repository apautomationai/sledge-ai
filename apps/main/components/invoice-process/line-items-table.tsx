"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { LineItemAutocomplete } from "./line-item-autocomplete-simple";
import { fetchQuickBooksAccounts, fetchQuickBooksItems, fetchQuickBooksCustomers } from "@/lib/services/quickbooks.service";
import type { QuickBooksAccount, QuickBooksItem, QuickBooksCustomer } from "@/lib/services/quickbooks.service";
import type { LineItem } from "@/lib/types/invoice";
import { toast } from "sonner";
import { client } from "@/lib/axios-client";
import { Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@workspace/ui/components/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@workspace/ui/components/dialog";

interface LineItemsTableProps {
    lineItems: LineItem[];
    onUpdate?: (updatedLineItem: LineItem) => void;
    onChange?: (lineItemId: number, changes: Partial<LineItem>) => void;
    onDelete?: (lineItemId: number) => void;
    isEditing?: boolean;
    isQuickBooksConnected?: boolean | null;
    selectedItems?: Set<number>;
    onSelectionChange?: (selectedIds: Set<number>) => void;
}

export function LineItemsTable({
    lineItems,
    selectedItems: externalSelectedItems,
    onSelectionChange,
    onChange,
    onDelete,
    isEditing = false,
    isQuickBooksConnected = null
}: LineItemsTableProps) {
    const router = useRouter();
    const [accounts, setAccounts] = useState<QuickBooksAccount[]>([]);
    const [items, setItems] = useState<QuickBooksItem[]>([]);
    const [customers, setCustomers] = useState<QuickBooksCustomer[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isQuickBooksErrorOpen, setIsQuickBooksErrorOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lineItem?: LineItem }>({ open: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [internalSelectedItems, setInternalSelectedItems] = useState<Set<number>>(new Set());

    // Use external selection if provided, otherwise use internal
    const selectedItems = externalSelectedItems || internalSelectedItems;
    const setSelectedItems = onSelectionChange
        ? (items: Set<number>) => onSelectionChange(items)
        : setInternalSelectedItems;

    // Local state for each line item - initialize with actual values
    const getInitialStates = () => {
        const initialStates: Record<number, {
            item_name: string;
            quantity: string;
            rate: string;
            amount: string;
            itemType: 'account' | 'product' | null;
            resourceId: string | null;
            customerId: string | null;
        }> = {};
        lineItems.forEach(item => {
            initialStates[item.id] = {
                item_name: item.item_name || "",
                quantity: item.quantity || "1",
                rate: item.rate || "0",
                amount: item.amount || "0",
                itemType: item.itemType || null,
                resourceId: item.resourceId ? String(item.resourceId) : null,
                customerId: item.customerId ? String(item.customerId) : null,
            };
        });
        return initialStates;
    };

    const [lineItemStates, setLineItemStates] = useState(getInitialStates);

    // Update states when lineItems change
    useEffect(() => {
        setLineItemStates(getInitialStates());
    }, [lineItems.length]); // Only re-initialize when items are added/removed

    // Load accounts, items, and customers when needed
    useEffect(() => {
        if (isQuickBooksConnected) {
            const needsAccounts = lineItems.some(item => item.itemType === 'account');
            const needsItems = lineItems.some(item => item.itemType === 'product');

            if (needsAccounts && accounts.length === 0 && !isLoadingAccounts) {
                loadAccounts();
            }
            if (needsItems && items.length === 0 && !isLoadingItems) {
                loadItems();
            }
            // Always load customers if connected and not already loaded
            if (customers.length === 0 && !isLoadingCustomers) {
                loadCustomers();
            }
        }
    }, [lineItems, isQuickBooksConnected]);

    const loadAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
            const fetchedAccounts = await fetchQuickBooksAccounts();
            setAccounts(fetchedAccounts);
        } catch (error) {
            console.error("Error loading accounts:", error);
            toast.error("Failed to load accounts");
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const loadItems = async () => {
        setIsLoadingItems(true);
        try {
            const fetchedItems = await fetchQuickBooksItems();
            setItems(fetchedItems);
        } catch (error) {
            console.error("Error loading items:", error);
            toast.error("Failed to load products/services");
        } finally {
            setIsLoadingItems(false);
        }
    };

    const loadCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const fetchedCustomers = await fetchQuickBooksCustomers();
            setCustomers(fetchedCustomers);
        } catch (error) {
            console.error("Error loading customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const updateLineItemState = (lineItemId: number, updates: Partial<typeof lineItemStates[number]>) => {
        setLineItemStates(prev => {
            const current = prev[lineItemId] || {
                item_name: "",
                quantity: "1",
                rate: "0",
                amount: "0",
                itemType: null,
                resourceId: null,
                customerId: null,
            };
            return {
                ...prev,
                [lineItemId]: { ...current, ...updates }
            };
        });
    };

    const handleItemNameChange = (lineItemId: number, value: string) => {
        updateLineItemState(lineItemId, { item_name: value });

        if (onChange) {
            onChange(lineItemId, { item_name: value });
        }
    };

    const handleQuantityChange = (lineItemId: number, value: string) => {
        const state = lineItemStates[lineItemId];
        if (!state) return;

        let calculatedAmount = state.amount;

        if (state.rate && value) {
            calculatedAmount = (parseFloat(value) * parseFloat(state.rate)).toFixed(2);
        }

        updateLineItemState(lineItemId, { quantity: value, amount: calculatedAmount });

        if (onChange) {
            onChange(lineItemId, { quantity: value, amount: calculatedAmount });
        }
    };

    const handleRateChange = (lineItemId: number, value: string) => {
        const state = lineItemStates[lineItemId];
        if (!state) return;

        let calculatedAmount = state.amount;

        if (state.quantity && value) {
            calculatedAmount = (parseFloat(state.quantity) * parseFloat(value)).toFixed(2);
        }

        updateLineItemState(lineItemId, { rate: value, amount: calculatedAmount });

        if (onChange) {
            onChange(lineItemId, { rate: value, amount: calculatedAmount });
        }
    };

    const handleAmountChange = (lineItemId: number, value: string) => {
        updateLineItemState(lineItemId, { amount: value });

        if (onChange) {
            onChange(lineItemId, { amount: value });
        }
    };

    const handleItemTypeChange = (lineItemId: number, newType: 'account' | 'product' | null) => {
        if (newType && !isQuickBooksConnected) {
            setIsQuickBooksErrorOpen(true);
            return;
        }

        updateLineItemState(lineItemId, { itemType: newType, resourceId: null });

        if (onChange) {
            onChange(lineItemId, { itemType: newType, resourceId: null });
        }

        // Load data if needed
        if (newType === 'account' && accounts.length === 0) {
            loadAccounts();
        } else if (newType === 'product' && items.length === 0) {
            loadItems();
        }
    };

    const handleResourceSelect = (lineItemId: number, resourceId: string, type: 'account' | 'product') => {
        updateLineItemState(lineItemId, { resourceId });

        if (onChange) {
            onChange(lineItemId, { itemType: type, resourceId });
        }
    };

    const handleCustomerSelect = (lineItemId: number, customerId: string) => {
        updateLineItemState(lineItemId, { customerId });

        if (onChange) {
            onChange(lineItemId, { customerId });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(lineItems.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (itemId: number, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(itemId);
        } else {
            newSelected.delete(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleDelete = async () => {
        if (!deleteDialog.lineItem) return;

        setIsDeleting(true);
        try {
            await client.delete(`/api/v1/invoice/line-items/${deleteDialog.lineItem.id}`);
            toast.success("Line item deleted successfully");
            setDeleteDialog({ open: false });

            if (onDelete) {
                onDelete(deleteDialog.lineItem.id);
            }
        } catch (error) {
            console.error("Error deleting line item:", error);
            toast.error("Failed to delete line item");
        } finally {
            setIsDeleting(false);
        }
    };

    const getAccountDisplayName = (account: QuickBooksAccount) => {
        return account.FullyQualifiedName || account.Name;
    };

    const getItemDisplayName = (item: QuickBooksItem) => {
        return item.FullyQualifiedName || item.Name;
    };

    const getCustomerDisplayName = (customer: QuickBooksCustomer) => {
        return customer.displayName || customer.companyName || 'Unknown';
    };

    if (lineItems.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No line items yet
            </div>
        );
    }

    return (
        <>
            <TooltipProvider>
                <div className="rounded-lg">
                    <div className="overflow-x-auto">
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[4%] px-2 py-2">
                                        <Checkbox
                                            checked={selectedItems.size === lineItems.length && lineItems.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[14%] px-2 py-2">Item Name</TableHead>
                                    <TableHead className="w-[8%] px-2 py-2">Qty</TableHead>
                                    <TableHead className="w-[8%] px-2 py-2">Rate</TableHead>
                                    <TableHead className="w-[8%] px-2 py-2">Amount</TableHead>
                                    <TableHead className="w-[12%] px-2 py-2">Type</TableHead>
                                    <TableHead className="w-[18%] px-2 py-2">Category</TableHead>
                                    <TableHead className="w-[18%] px-2 py-2">Customer</TableHead>
                                    {isEditing && <TableHead className="w-[6%] px-2 py-2"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineItems.map((lineItem) => {
                                    const state = lineItemStates[lineItem.id] || {
                                        item_name: lineItem.item_name || "",
                                        quantity: lineItem.quantity || "1",
                                        rate: lineItem.rate || "0",
                                        amount: lineItem.amount || "0",
                                        itemType: lineItem.itemType || null,
                                        resourceId: lineItem.resourceId ? String(lineItem.resourceId) : null,
                                        customerId: lineItem.customerId ? String(lineItem.customerId) : null,
                                    };

                                    return (
                                        <TableRow key={lineItem.id}>
                                            <TableCell className="px-2 py-2">
                                                <Checkbox
                                                    checked={selectedItems.has(lineItem.id)}
                                                    onCheckedChange={(checked) => handleSelectItem(lineItem.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium max-w-0 px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        {isEditing ? (
                                                            <div>
                                                                <Input
                                                                    type="text"
                                                                    value={state.item_name}
                                                                    onChange={(e) => handleItemNameChange(lineItem.id, e.target.value)}
                                                                    className="h-8 px-2"
                                                                    placeholder="Item name"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="truncate cursor-default">
                                                                {lineItem.item_name || `Item ${lineItem.id}`}
                                                            </div>
                                                        )}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {state.item_name || lineItem.item_name || `Item ${lineItem.id}`}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={state.quantity}
                                                                onChange={(e) => handleQuantityChange(lineItem.id, e.target.value)}
                                                                className="h-8 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Quantity: {state.quantity}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={state.rate}
                                                                onChange={(e) => handleRateChange(lineItem.id, e.target.value)}
                                                                className="h-8 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Rate: ${state.rate}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={state.amount}
                                                                onChange={(e) => handleAmountChange(lineItem.id, e.target.value)}
                                                                className="h-8 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Amount: ${state.amount}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            {isQuickBooksConnected === false ? (
                                                                <div
                                                                    className="h-8 px-2 border border-input bg-background rounded-md text-xs text-muted-foreground cursor-pointer hover:bg-accent flex items-center"
                                                                    onClick={() => setIsQuickBooksErrorOpen(true)}
                                                                >
                                                                    Connect QB
                                                                </div>
                                                            ) : isQuickBooksConnected === null ? (
                                                                <div className="h-8 px-2 border border-input bg-background rounded-md text-xs text-muted-foreground flex items-center">
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                    Loading...
                                                                </div>
                                                            ) : (
                                                                <Select
                                                                    value={state.itemType || undefined}
                                                                    onValueChange={(value) => handleItemTypeChange(lineItem.id, value as 'account' | 'product')}
                                                                    disabled={!isEditing}
                                                                >
                                                                    <SelectTrigger className="h-8">
                                                                        <SelectValue placeholder="Select..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="account">Account</SelectItem>
                                                                        <SelectItem value="product">Product</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Type: {state.itemType === 'account' ? 'Account' : state.itemType === 'product' ? 'Product' : 'Not selected'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative">
                                                            {state.itemType === 'account' ? (
                                                                <LineItemAutocomplete
                                                                    items={accounts}
                                                                    value={state.resourceId}
                                                                    onSelect={(id, account) => handleResourceSelect(lineItem.id, id, 'account')}
                                                                    isLoading={isLoadingAccounts}
                                                                    disabled={!isEditing}
                                                                    getDisplayName={getAccountDisplayName}
                                                                />
                                                            ) : state.itemType === 'product' ? (
                                                                <LineItemAutocomplete
                                                                    items={items}
                                                                    value={state.resourceId}
                                                                    onSelect={(id, item) => handleResourceSelect(lineItem.id, id, 'product')}
                                                                    isLoading={isLoadingItems}
                                                                    disabled={!isEditing}
                                                                    getDisplayName={getItemDisplayName}
                                                                />
                                                            ) : (
                                                                <div className="text-xs text-muted-foreground">Select type first</div>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {state.resourceId ? (
                                                            state.itemType === 'account'
                                                                ? `Account: ${accounts.find(a => String(a.Id) === state.resourceId)?.FullyQualifiedName || 'Selected'}`
                                                                : `Product: ${items.find(i => String(i.Id) === state.resourceId)?.FullyQualifiedName || 'Selected'}`
                                                        ) : 'No category selected'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="px-2 py-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative">
                                                            {isQuickBooksConnected === false ? (
                                                                <div
                                                                    className="h-8 px-2 border border-input bg-background rounded-md text-xs text-muted-foreground cursor-pointer hover:bg-accent flex items-center"
                                                                    onClick={() => setIsQuickBooksErrorOpen(true)}
                                                                >
                                                                    Connect QB
                                                                </div>
                                                            ) : isQuickBooksConnected === null ? (
                                                                <div className="h-8 px-2 border border-input bg-background rounded-md text-xs text-muted-foreground flex items-center">
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                    Loading...
                                                                </div>
                                                            ) : (
                                                                <LineItemAutocomplete<QuickBooksCustomer>
                                                                    items={customers}
                                                                    value={state.customerId}
                                                                    onSelect={(id) => handleCustomerSelect(lineItem.id, id)}
                                                                    isLoading={isLoadingCustomers}
                                                                    disabled={!isEditing}
                                                                    getDisplayName={getCustomerDisplayName}
                                                                />
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {state.customerId
                                                            ? `Customer: ${customers.find(c => String(c.quickbooksId) === state.customerId)?.displayName || 'Selected'}`
                                                            : 'No customer selected'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            {isEditing && (
                                                <TableCell className="px-2 py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, lineItem })}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Line Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this line item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteDialog.lineItem && (
                        <div className="my-4">
                            <div className="bg-muted rounded-lg p-4">
                                <p className="text-sm font-medium">{deleteDialog.lineItem.item_name || `Item ${deleteDialog.lineItem.id}`}</p>
                                {deleteDialog.lineItem.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{deleteDialog.lineItem.description}</p>
                                )}
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Amount: </span>
                                    <span className="font-medium">${deleteDialog.lineItem.amount || '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting}>Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QuickBooks Integration Error Dialog */}
            <Dialog open={isQuickBooksErrorOpen} onOpenChange={setIsQuickBooksErrorOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QuickBooks Integration Required</DialogTitle>
                        <DialogDescription>
                            To categorize line items with accounts and products/services, you need to connect your QuickBooks account first.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Integration Not Connected
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            Please connect your QuickBooks account in the integrations page to enable line item categorization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                setIsQuickBooksErrorOpen(false);
                                router.push('/integrations');
                            }}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Go to Integrations
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
