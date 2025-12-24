"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { LineItemAutocomplete } from "./line-item-autocomplete-simple";
import { fetchQuickBooksAccountsFromDB, fetchQuickBooksProductsFromDB, updateLineItem } from "@/lib/services/quickbooks.service";
import type { DBQuickBooksAccount, DBQuickBooksProduct } from "@/lib/services/quickbooks.service";
import type { LineItem } from "@/lib/types/invoice";
import { toast } from "sonner";
import { client } from "@/lib/axios-client";
import { Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog";

interface LineItemEditorProps {
  lineItem: LineItem;
  onUpdate?: (updatedLineItem: LineItem) => void;
  onChange?: (lineItemId: number, changes: Partial<LineItem>) => void;
  onDelete?: (lineItemId: number) => void;
  isEditing?: boolean;
  isQuickBooksConnected?: boolean | null;
}

export function LineItemEditor({ lineItem, onUpdate, onChange, onDelete, isEditing = false, isQuickBooksConnected = null }: LineItemEditorProps) {
  const router = useRouter();
  const [itemType, setItemType] = useState<'account' | 'product' | null>(lineItem.itemType || null);
  const [accounts, setAccounts] = useState<DBQuickBooksAccount[]>([]);
  const [items, setItems] = useState<DBQuickBooksProduct[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    lineItem.resourceId ? String(lineItem.resourceId) : null
  );
  const [isQuickBooksErrorOpen, setIsQuickBooksErrorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable fields state
  const [quantity, setQuantity] = useState(lineItem.quantity || "1");
  const [rate, setRate] = useState(lineItem.rate || "0");
  const [amount, setAmount] = useState(lineItem.amount || "0");

  console.log(items)

  console.log("🔧 LineItemEditor mounted with:", {
    itemType: lineItem.itemType,
    resourceId: lineItem.resourceId,
    selectedResourceId,
    isQuickBooksConnected
  });

  // Load accounts when component mounts or when itemType changes to 'account'
  useEffect(() => {
    if (itemType === 'account' && accounts.length === 0 && !isLoadingAccounts) {
      if (isQuickBooksConnected) {
        loadAccounts();
      } else if (isQuickBooksConnected === false) {
        console.log("💰 Skipping accounts load - QuickBooks not connected");
      }
    }
  }, [itemType, accounts.length, isLoadingAccounts, isQuickBooksConnected]);

  // Load items when component mounts or when itemType changes to 'product'
  useEffect(() => {
    if (itemType === 'product' && items.length === 0 && !isLoadingItems) {
      if (isQuickBooksConnected) {
        loadItems();
      } else if (isQuickBooksConnected === false) {
        console.log("🛍️ Skipping products load - QuickBooks not connected");
      }
    }
  }, [itemType, items.length, isLoadingItems, isQuickBooksConnected]);

  // Initial load effect - ensure data is loaded on component mount if itemType is already set
  useEffect(() => {
    console.log("🚀 Initial load effect - itemType:", itemType, "isQuickBooksConnected:", isQuickBooksConnected);
    if (itemType === 'account' && accounts.length === 0 && !isLoadingAccounts) {
      if (isQuickBooksConnected) {
        console.log("🚀 Loading accounts on mount");
        loadAccounts();
      } else if (isQuickBooksConnected === false) {
        console.log("🚀 Skipping accounts load on mount - QuickBooks not connected");
      }
    } else if (itemType === 'product' && items.length === 0 && !isLoadingItems) {
      if (isQuickBooksConnected) {
        console.log("🚀 Loading products on mount");
        loadItems();
      } else if (isQuickBooksConnected === false) {
        console.log("🚀 Skipping products load on mount - QuickBooks not connected");
      }
    }
  }, [isQuickBooksConnected]); // Run when connection status changes

  const loadAccounts = async () => {
    console.log("💰 Loading accounts...");
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
    console.log("🛍️ Loading products/services...");
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

  const handleItemTypeChange = (newType: 'account' | 'product' | null) => {
    // Check if QuickBooks is connected before allowing type selection
    if (newType && !isQuickBooksConnected) {
      setIsQuickBooksErrorOpen(true);
      return;
    }

    setItemType(newType);
    setSelectedResourceId(null); // Clear resourceId when changing type

    // Notify parent of changes without saving
    if (onChange) {
      onChange(lineItem.id, {
        itemType: newType,
        resourceId: null,
      });
    }
  };

  const handleAccountSelect = (accountId: string, account?: DBQuickBooksAccount) => {
    const quickbooksId = account?.quickbooksId || null;
    setSelectedResourceId(quickbooksId);

    // Notify parent of changes without saving
    if (onChange) {
      onChange(lineItem.id, {
        itemType: 'account',
        resourceId: quickbooksId,
      });
    }
  };

  const handleProductSelect = (productId: string, product?: DBQuickBooksProduct) => {
    const quickbooksId = product?.quickbooksId || null;
    setSelectedResourceId(quickbooksId);

    // Notify parent of changes without saving
    if (onChange) {
      onChange(lineItem.id, {
        itemType: 'product',
        resourceId: quickbooksId,
      });
    }
  };

  const getAccountDisplayName = (account: DBQuickBooksAccount) => {
    return account.fullyQualifiedName || account.name || 'Unknown Account';
  };

  const getItemDisplayName = (item: DBQuickBooksProduct) => {
    return item.fullyQualifiedName || item.name || 'Unknown Product';
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);

    // Auto-calculate amount if rate is set
    let calculatedAmount = amount;
    if (rate && value) {
      calculatedAmount = (parseFloat(value) * parseFloat(rate)).toFixed(2);
      setAmount(calculatedAmount);
    }

    // Notify parent of changes
    if (onChange) {
      onChange(lineItem.id, {
        quantity: value,
        amount: calculatedAmount,
      });
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRate(value);

    // Auto-calculate amount if quantity is set
    let calculatedAmount = amount;
    if (quantity && value) {
      calculatedAmount = (parseFloat(quantity) * parseFloat(value)).toFixed(2);
      setAmount(calculatedAmount);
    }

    // Notify parent of changes
    if (onChange) {
      onChange(lineItem.id, {
        rate: value,
        amount: calculatedAmount,
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    // Notify parent of changes
    if (onChange) {
      onChange(lineItem.id, {
        amount: value,
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await client.delete(`/api/v1/invoice/line-items/${lineItem.id}`);
      toast.success("Line item deleted successfully");
      setIsDeleteDialogOpen(false);

      // Notify parent to remove from list
      if (onDelete) {
        onDelete(lineItem.id);
      }
    } catch (error) {
      console.error("Error deleting line item:", error);
      toast.error("Failed to delete line item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card p-3 text-sm space-y-3">
      {/* Line Item Info */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <span className="font-medium text-foreground">
            {lineItem.item_name || `Item ${lineItem.id}`}
          </span>
          {lineItem.description && (
            <p className="text-muted-foreground text-xs mt-1">
              {lineItem.description}
            </p>
          )}
        </div>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        )}
      </div>

      {/* Editable Fields */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="space-y-1">
          <Label htmlFor={`quantity-${lineItem.id}`} className="text-xs">
            Quantity
          </Label>
          <Input
            id={`quantity-${lineItem.id}`}
            type="number"
            step="0.01"
            value={quantity}
            onChange={handleQuantityChange}
            className="h-8 text-xs"
            disabled={!isEditing || isSaving}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`rate-${lineItem.id}`} className="text-xs">
            Rate ($)
          </Label>
          <Input
            id={`rate-${lineItem.id}`}
            type="number"
            step="0.01"
            value={rate}
            onChange={handleRateChange}
            className="h-8 text-xs"
            disabled={!isEditing || isSaving}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`amount-${lineItem.id}`} className="text-xs">
            Amount ($)
          </Label>
          <Input
            id={`amount-${lineItem.id}`}
            type="number"
            step="0.01"
            value={amount}
            onChange={handleAmountChange}
            className="h-8 text-xs"
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>

      {/* Item Type Selector */}
      <div className="space-y-2">
        <Label htmlFor={`item-type-${lineItem.id}`} className="text-xs">
          Item Type
        </Label>
        {isQuickBooksConnected === false ? (
          <div
            className="h-9 px-3 py-2 border border-input bg-background rounded-md text-sm text-muted-foreground cursor-pointer hover:bg-accent flex items-center"
            onClick={() => setIsQuickBooksErrorOpen(true)}
          >
            Connect QuickBooks to categorize items
          </div>
        ) : isQuickBooksConnected === null ? (
          <div className="h-9 px-3 py-2 border border-input bg-background rounded-md text-sm text-muted-foreground flex items-center">
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Checking connection...
          </div>
        ) : (
          <Select
            value={itemType || undefined}
            onValueChange={(value) => handleItemTypeChange(value as 'account' | 'product' | null)}
            disabled={!isEditing || isSaving || isQuickBooksConnected === null}
          >
            <SelectTrigger id={`item-type-${lineItem.id}`} className="h-9">
              <SelectValue placeholder={isQuickBooksConnected === null ? "Checking connection..." : "Select type..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="product">Product/Service</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Autocomplete Field */}
      {itemType && (
        <div className="space-y-2">
          <Label htmlFor={`autocomplete-${lineItem.id}`} className="text-xs">
            {itemType === 'account' ? 'Account' : 'Product/Service'}
          </Label>
          {itemType === 'account' ? (
            <LineItemAutocomplete
              items={accounts}
              value={selectedResourceId}
              onSelect={handleAccountSelect}
              placeholder="Search accounts..."
              isLoading={isLoadingAccounts}
              disabled={!isEditing || isSaving}
              getDisplayName={getAccountDisplayName}
            />
          ) : (
            <LineItemAutocomplete
              items={items}
              value={selectedResourceId}
              onSelect={handleProductSelect}
              placeholder="Search products/services..."
              isLoading={isLoadingItems}
              disabled={!isEditing || isSaving}
              getDisplayName={getItemDisplayName}
            />
          )}
        </div>
      )}



      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Line Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this line item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">{lineItem.item_name || `Item ${lineItem.id}`}</p>
              {lineItem.description && (
                <p className="text-sm text-muted-foreground mt-1">{lineItem.description}</p>
              )}
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Amount: </span>
                <span className="font-medium">${lineItem.amount || '0.00'}</span>
              </div>
            </div>
          </div>
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

      {/* QuickBooks Integration Error Dialog (same as in confirmation modals) */}
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
    </div>
  );
}

