"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus, Loader2 } from "lucide-react";
import { client } from "@/lib/axios-client";
import { toast } from "sonner";
import type { LineItem } from "@/lib/types/invoice";
import { LineItemAutocomplete } from "./line-item-autocomplete-simple";
import { fetchQuickBooksAccountsFromDB, fetchQuickBooksProductsFromDB, fetchQuickBooksCustomers } from "@/lib/services/quickbooks.service";
import type { DBQuickBooksAccount, DBQuickBooksProduct, QuickBooksCustomer } from "@/lib/services/quickbooks.service";

interface AddLineItemDialogProps {
    invoiceId: number;
    onLineItemAdded: (newLineItem: LineItem) => void;
    isQuickBooksConnected?: boolean | null;
}

export function AddLineItemDialog({ invoiceId, onLineItemAdded, isQuickBooksConnected = null }: AddLineItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<DBQuickBooksAccount[]>([]);
    const [items, setItems] = useState<DBQuickBooksProduct[]>([]);
    const [customers, setCustomers] = useState<QuickBooksCustomer[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [formData, setFormData] = useState({
        item_name: "",
        description: "",
        quantity: "1",
        rate: "0",
        amount: "0",
        itemType: null as 'account' | 'product' | null,
        resourceId: null as string | null,
        customerId: null as string | null,
    });

    // Load accounts, items, and customers when dialog opens
    useEffect(() => {
        if (isOpen && isQuickBooksConnected) {
            if (customers.length === 0 && !isLoadingCustomers) {
                loadCustomers();
            }
        }
    }, [isOpen, isQuickBooksConnected]);

    // Load accounts and items when type is selected
    useEffect(() => {
        if (formData.itemType === 'account' && accounts.length === 0 && !isLoadingAccounts) {
            loadAccounts();
        } else if (formData.itemType === 'product' && items.length === 0 && !isLoadingItems) {
            loadItems();
        }
    }, [formData.itemType]);

    const loadAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
            const fetchedAccounts = await fetchQuickBooksAccountsFromDB();
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
            const fetchedItems = await fetchQuickBooksProductsFromDB();
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate amount when quantity or rate changes
            if (name === "quantity" || name === "rate") {
                const qty = parseFloat(name === "quantity" ? value : updated.quantity) || 0;
                const rt = parseFloat(name === "rate" ? value : updated.rate) || 0;
                updated.amount = (qty * rt).toFixed(2);
            }

            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.item_name.trim()) {
            toast.error("Item name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const response: any = await client.post("/api/v1/invoice/line-items", {
                invoiceId,
                item_name: formData.item_name,
                description: formData.description || null,
                quantity: formData.quantity,
                rate: formData.rate,
                amount: formData.amount,
                itemType: formData.itemType,
                resourceId: formData.resourceId,
                customerId: formData.customerId,
            });

            if (response.success) {
                toast.success("Line item added successfully");
                onLineItemAdded(response.data);
                setIsOpen(false);
                // Reset form
                setFormData({
                    item_name: "",
                    description: "",
                    quantity: "1",
                    rate: "0",
                    amount: "0",
                    itemType: null,
                    resourceId: null,
                    customerId: null,
                });
            }
        } catch (error) {
            console.error("Error adding line item:", error);
            toast.error("Failed to add line item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAccountDisplayName = (account: DBQuickBooksAccount) => {
        return account.fullyQualifiedName || account.name || 'Unknown Account';
    };

    const getItemDisplayName = (item: DBQuickBooksProduct) => {
        return item.fullyQualifiedName || item.name || 'Unknown Product';
    };

    const getCustomerDisplayName = (customer: QuickBooksCustomer) => {
        return customer.displayName || customer.companyName || 'Unknown';
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2 w-full">
                    <Plus className="h-4 w-4" />
                    Add Line Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Line Item</DialogTitle>
                        <DialogDescription>
                            Add a new line item to this invoice. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="item_name">
                                Item Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="item_name"
                                name="item_name"
                                value={formData.item_name}
                                onChange={handleInputChange}
                                placeholder="Enter item name"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter description (optional)"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rate">Rate ($)</Label>
                                <Input
                                    id="rate"
                                    name="rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.rate}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="itemType">Type</Label>
                                {isQuickBooksConnected === false ? (
                                    <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted">
                                        Connect QuickBooks to use types
                                    </div>
                                ) : isQuickBooksConnected === null ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 border rounded-md bg-muted">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.itemType || undefined}
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            itemType: value as 'account' | 'product',
                                            resourceId: null // Reset category when type changes
                                        }))}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="account">Account</SelectItem>
                                            <SelectItem value="product">Product</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                {!formData.itemType ? (
                                    <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted">
                                        Select type first
                                    </div>
                                ) : formData.itemType === 'account' ? (
                                    <LineItemAutocomplete
                                        items={accounts}
                                        value={formData.resourceId}
                                        onSelect={(id, account) => {
                                            const quickbooksId = account?.quickbooksId || null;
                                            setFormData(prev => ({ ...prev, resourceId: quickbooksId }));
                                        }}
                                        isLoading={isLoadingAccounts}
                                        disabled={isSubmitting}
                                        getDisplayName={getAccountDisplayName}
                                    />
                                ) : (
                                    <LineItemAutocomplete
                                        items={items}
                                        value={formData.resourceId}
                                        onSelect={(id, item) => {
                                            const quickbooksId = item?.quickbooksId || null;
                                            setFormData(prev => ({ ...prev, resourceId: quickbooksId }));
                                        }}
                                        isLoading={isLoadingItems}
                                        disabled={isSubmitting}
                                        getDisplayName={getItemDisplayName}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer</Label>
                            {isQuickBooksConnected === false ? (
                                <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted">
                                    Connect QuickBooks to select customers
                                </div>
                            ) : isQuickBooksConnected === null ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 border rounded-md bg-muted">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading...
                                </div>
                            ) : (
                                <LineItemAutocomplete<QuickBooksCustomer>
                                    items={customers}
                                    value={formData.customerId}
                                    onSelect={(id, customer) => {
                                        const quickbooksId = customer?.quickbooksId || null;
                                        setFormData(prev => ({ ...prev, customerId: quickbooksId }));
                                    }}
                                    isLoading={isLoadingCustomers}
                                    disabled={isSubmitting}
                                    getDisplayName={getCustomerDisplayName}
                                    placeholder="Select customer..."
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Line Item"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
