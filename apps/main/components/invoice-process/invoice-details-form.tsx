"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

import { InvoiceDetails, LineItem } from "@/lib/types/invoice";
import ConfirmationModals from "./confirmation-modals";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { formatLabel, formatDate } from "@/lib/utility/formatters";
import { client } from "@/lib/axios-client";
import { Loader2, AlertTriangle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { LineItemsTable } from "./line-items-table";
import { AddLineItemDialog } from "./add-line-item-dialog";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { LineItemAutocomplete } from "./line-item-autocomplete-simple";
import { EnhancedLineItemAutocomplete } from "./enhanced-line-item-autocomplete";
import { AddCustomerModal } from "./add-customer-modal";
import { AddProductModal } from "./add-product-modal";
import { AddAccountModal } from "./add-account-modal";
import { fetchQuickBooksAccountsFromDB, fetchQuickBooksProductsFromDB } from "@/lib/services/quickbooks.service";
import type { DBQuickBooksAccount, DBQuickBooksProduct, QuickBooksCustomer } from "@/lib/services/quickbooks.service";
import { useQuickBooksData } from "./quickbooks-data-provider";

const FormField = ({
  fieldKey,
  label,
  value,
  isEditing,
  onChange,
  onDateChange,
  highlighted = false,
}: {
  fieldKey: string;
  label: string;
  value: string | number | boolean | any[] | null | undefined;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (fieldKey: string, dateString: string | undefined) => void;
  highlighted?: boolean;
}) => {
  const isDateField = fieldKey === 'invoiceDate' || fieldKey === 'dueDate';
  const isBooleanField = typeof value === 'boolean';
  const isArrayField = Array.isArray(value);
  const isTotalAmountField = fieldKey === 'totalAmount';

  // Use local state for the input to avoid cursor jumping
  const [localValue, setLocalValue] = useState(value ?? "");

  // Update local value when prop changes (e.g., when switching invoices)
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  // For display-only fields (arrays, booleans), compute display value
  const displayValue = isArrayField
    ? `${value.length} item(s)`
    : isBooleanField
      ? (value ? "Yes" : "No")
      : isDateField
        ? formatDate(value as string)
        : value ?? "N/A";

  // For editable fields, use the local value
  const inputValue = isArrayField || isBooleanField
    ? String(displayValue)
    : String(localValue);

  // For date fields, use the formatted date string directly
  const dateStringValue = isDateField && value ? formatDate(value as string) : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only call onChange on blur to update parent
    onChange(e as any);
  };

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={fieldKey}
        className="text-xs font-medium"
      >
        {label}
        {highlighted && <span className="text-red-500 ml-1">*</span>}
        {isTotalAmountField && (
          <span className="ml-1 text-xs text-muted-foreground font-normal">(Auto-calculated)</span>
        )}
      </Label>

      {isDateField && isEditing ? (
        <DatePicker
          value={dateStringValue}
          onDateChange={(dateString) => onDateChange?.(fieldKey, dateString)}
          placeholder={`Select ${label.toLowerCase()}`}
          className="h-8"
        />
      ) : (
        <Input
          id={fieldKey}
          name={fieldKey}
          value={isDateField ? (formatDate(value as string) ?? "") : inputValue}
          readOnly={!isEditing || isArrayField || isBooleanField || isTotalAmountField}
          onChange={handleChange}
          onBlur={handleBlur}
          className="h-8 read-only:bg-muted/50 read-only:border-dashed read-only:cursor-not-allowed"
        />
      )}
    </div>
  );
};

interface InvoiceDetailsFormProps {
  invoiceDetails: InvoiceDetails;
  originalInvoiceDetails: InvoiceDetails;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onDetailsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFields: string[];
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  onSave: (vendorData?: any, customerData?: any) => Promise<void>;
  onReject: () => Promise<void>;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  onApprovalSuccess?: () => void;
  onInvoiceDetailsUpdate?: (updatedDetails: InvoiceDetails) => void;
  onFieldChange?: () => void;
  setInvoicesList?: (invoices: any[]) => void;
  setSelectedInvoiceId?: (id: number) => void;
  setInvoiceDetails?: (details: InvoiceDetails) => void;
  setOriginalInvoiceDetails?: (details: InvoiceDetails) => void;
  setInvoiceDetailsCache?: (cache: any) => void;
  lineItemChangesRef?: React.MutableRefObject<{
    saveLineItemChanges: () => Promise<void>;
    hasChanges: () => boolean;
  } | null>;
}

export default function InvoiceDetailsForm({
  invoiceDetails,
  originalInvoiceDetails,
  isEditing,
  setIsEditing,
  onDetailsChange,
  selectedFields,
  onSave,
  onReject,
  onApprove,
  onCancel,
  onApprovalSuccess,
  onInvoiceDetailsUpdate,
  onFieldChange,
  lineItemChangesRef,
}: InvoiceDetailsFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [localInvoiceDetails, setLocalInvoiceDetails] = useState<InvoiceDetails>(invoiceDetails);
  const [isQuickBooksConnected, setIsQuickBooksConnected] = useState<boolean | null>(null);
  const [lineItemChanges, setLineItemChanges] = useState<Record<number, Partial<LineItem>>>({});

  // Check if invoice is finalized (approved or rejected)
  const isInvoiceFinalized = invoiceDetails.status === "approved" || invoiceDetails.status === "rejected";
  const [selectedLineItems, setSelectedLineItems] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangeTypeDialog, setShowChangeTypeDialog] = useState(false);
  const [lineItemsViewMode, setLineItemsViewMode] = useState<'single' | 'expand'>('single');

  // Ref to access single mode save function
  const singleModeSaveRef = useRef<(() => Promise<void>) | null>(null);
  // Accordion state management
  const [accordionValue, setAccordionValue] = useState<string[]>(["invoice-info", "line-items"]);
  // Use shared QuickBooks data from context
  const { customers: bulkCustomers, isLoadingCustomers, loadCustomers } = useQuickBooksData();

  const [bulkItemType, setBulkItemType] = useState<'account' | 'product' | null>(null);
  const [bulkResourceId, setBulkResourceId] = useState<string | null>(null);
  const [bulkCustomerId, setBulkCustomerId] = useState<string | null>(null);
  const [isApplyingBulkChange, setIsApplyingBulkChange] = useState(false);
  const [bulkAccounts, setBulkAccounts] = useState<any[]>([]);
  const [bulkItems, setBulkItems] = useState<any[]>([]);
  const [isLoadingBulkData, setIsLoadingBulkData] = useState(false);

  // Modal states for bulk actions
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);

  const handleLineItemUpdate = (updatedLineItem: LineItem) => {
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedLineItem.id ? updatedLineItem : item
      )
    );
  };

  const handleLineItemChange = (lineItemId: number, changes: Partial<LineItem>) => {
    setLineItemChanges((prev) => ({
      ...prev,
      [lineItemId]: {
        ...prev[lineItemId],
        ...changes,
      },
    }));

    // Update line items in state to reflect changes
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === lineItemId ? { ...item, ...changes } : item
      )
    );

    // Notify parent that there are unsaved changes
    if (onFieldChange) {
      onFieldChange();
    }
  };

  const handleLineItemDelete = (lineItemId: number) => {
    // Remove from local state immediately for UI update
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== lineItemId));

    // Remove any pending changes for this line item
    setLineItemChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[lineItemId];
      return newChanges;
    });
  };

  const handleLineItemAdded = (newLineItem: LineItem) => {
    // Add to local state and sort alphabetically
    setLineItems((prevItems) => {
      const updatedItems = [...prevItems, newLineItem];
      return updatedItems.sort((a, b) => {
        const nameA = (a.item_name || '').toLowerCase();
        const nameB = (b.item_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });
  };

  // Method to save all line item changes
  const saveLineItemChanges = async () => {
    const changeEntries = Object.entries(lineItemChanges);

    if (changeEntries.length === 0) {
      return; // No changes to save
    }

    try {
      // Save all line item changes in parallel
      await Promise.all(
        changeEntries.map(([lineItemId, changes]) => {
          return client.patch(`/api/v1/invoice/line-items/${lineItemId}`, changes);
        })
      );

      // Clear the changes after successful save
      setLineItemChanges({});

      // Refresh line items to get updated data
      if (invoiceDetails?.id) {
        const url = lineItemsViewMode
          ? `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}?viewType=${lineItemsViewMode}`
          : `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}`;

        const response: any = await client.get(url);
        if (response.success) {
          // Sort line items by name (item_name)
          const sortedLineItems = [...response.data].sort((a, b) => {
            const nameA = (a.item_name || '').toLowerCase();
            const nameB = (b.item_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setLineItems(sortedLineItems);
        }
      }
    } catch (error) {
      console.error("Error saving line item changes:", error);
      throw error; // Re-throw to let parent handle the error
    }
  };

  // Method to delete selected line items
  const handleDeleteLineItems = async () => {
    if (selectedLineItems.size === 0) return;

    setIsDeleting(true);
    try {
      // Delete all selected line items in parallel
      await Promise.all(
        Array.from(selectedLineItems).map((lineItemId) =>
          client.delete(`/api/v1/invoice/line-items/${lineItemId}`)
        )
      );

      toast.success(`${selectedLineItems.size} line item(s) deleted successfully`);
      setSelectedLineItems(new Set());
      setShowDeleteDialog(false);

      // Refresh line items to get updated data
      if (invoiceDetails?.id) {
        const viewType = lineItemsViewMode ? getApiViewType(lineItemsViewMode) : undefined;
        const url = viewType
          ? `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}?viewType=${viewType}`
          : `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}`;

        const response: any = await client.get(url);
        if (response.success) {
          const sortedLineItems = [...response.data].sort((a, b) => {
            const nameA = (a.item_name || '').toLowerCase();
            const nameB = (b.item_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setLineItems(sortedLineItems);
        }
      }
    } catch (error) {
      console.error("Error deleting line items:", error);
      toast.error("Failed to delete line items");
    } finally {
      setIsDeleting(false);
    }
  };

  // Load QuickBooks accounts for bulk change
  const loadBulkAccounts = async () => {
    setIsLoadingBulkData(true);
    try {
      const accountsData = await fetchQuickBooksAccountsFromDB();
      setBulkAccounts(accountsData);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setIsLoadingBulkData(false);
    }
  };

  // Load QuickBooks items for bulk change
  const loadBulkItems = async () => {
    setIsLoadingBulkData(true);
    try {
      const itemsData = await fetchQuickBooksProductsFromDB();
      setBulkItems(itemsData);
    } catch (error) {
      console.error("Error loading products/services:", error);
      toast.error("Failed to load products/services");
    } finally {
      setIsLoadingBulkData(false);
    }
  };

  // Customers are now loaded from context - no need for separate function

  // Callback functions for when new items are created in bulk actions
  const handleBulkCustomerCreated = (newCustomer: any) => {
    // Refresh customers list from context
    loadCustomers();
  };

  const handleBulkProductCreated = (newProduct: any) => {
    // Refresh items list from database to ensure sync
    loadBulkItems();
  };

  const handleBulkAccountCreated = (newAccount: any) => {
    // Refresh accounts list from database to ensure sync
    loadBulkAccounts();
  };

  // Method to apply bulk item type change
  const handleApplyBulkChange = async () => {
    if (selectedLineItems.size === 0 || !bulkItemType) return;

    setIsApplyingBulkChange(true);
    try {
      // bulkResourceId and bulkCustomerId now already contain quickbooks_id values
      // No need to extract them again since we store them directly in state

      // Update all selected line items in parallel
      await Promise.all(
        Array.from(selectedLineItems).map((lineItemId) =>
          client.patch(`/api/v1/invoice/line-items/${lineItemId}`, {
            itemType: bulkItemType,
            resourceId: bulkResourceId, // Already contains quickbooks_id
            customerId: bulkCustomerId, // Already contains quickbooks_id
          })
        )
      );

      toast.success(`${selectedLineItems.size} line item(s) updated successfully`);

      // Refresh line items to get updated data
      if (invoiceDetails?.id) {
        const viewType = lineItemsViewMode ? getApiViewType(lineItemsViewMode) : undefined;
        const url = viewType
          ? `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}?viewType=${viewType}`
          : `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}`;

        const response: any = await client.get(url);
        if (response.success) {
          const sortedLineItems = [...response.data].sort((a, b) => {
            const nameA = (a.item_name || '').toLowerCase();
            const nameB = (b.item_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setLineItems(sortedLineItems);
        }
      }

      // Clear state after successful update
      setSelectedLineItems(new Set());
      setShowChangeTypeDialog(false);
      setBulkItemType(null);
      setBulkResourceId(null);
      setBulkCustomerId(null);
    } catch (error) {
      console.error("Error updating line items:", error);
      toast.error("Failed to update line items");
    } finally {
      setIsApplyingBulkChange(false);
    }
  };

  // Expose saveLineItemChanges to parent through ref
  useEffect(() => {
    if (lineItemChangesRef) {
      lineItemChangesRef.current = {
        saveLineItemChanges,
        hasChanges: () => Object.keys(lineItemChanges).length > 0,
      };
    }
  }, [lineItemChanges, lineItemChangesRef]);

  // QuickBooks integration check function (same as in confirmation modals)
  const checkQuickBooksIntegration = async (): Promise<boolean> => {
    try {
      const response: any = await client.get('/api/v1/quickbooks/status');
      return response?.data?.connected === true;
    } catch (error) {
      console.error('Error checking QuickBooks integration:', error);
      return false;
    }
  };

  // Update local state when invoiceDetails prop changes
  useEffect(() => {
    setLocalInvoiceDetails(invoiceDetails);
  }, [invoiceDetails]);

  // Check QuickBooks connection status once for all line items
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkQuickBooksIntegration();
        setIsQuickBooksConnected(isConnected);
      } catch (error) {
        console.error("Error checking QuickBooks connection:", error);
        setIsQuickBooksConnected(false);
      }
    };

    checkConnection();

    // Refresh connection status when user returns to the page (e.g., from integrations page)
    const handleFocus = () => {
      checkConnection();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Helper function to convert viewMode to API viewType
  const getApiViewType = (viewMode: 'single' | 'expand'): 'single' | 'expanded' => {
    return viewMode === 'expand' ? 'expanded' : 'single';
  };

  // Function to fetch line items
  const fetchLineItems = async (viewMode?: 'single' | 'expand') => {
    if (!invoiceDetails?.id) return;

    setIsLoadingLineItems(true);
    try {
      const viewType = viewMode ? getApiViewType(viewMode) : undefined;
      const url = viewType
        ? `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}?viewType=${viewType}`
        : `/api/v1/invoice/line-items/invoice/${invoiceDetails.id}`;

      const response: any = await client.get(url);
      if (response.success) {
        // Sort line items by name (item_name)
        const sortedLineItems = [...response.data].sort((a, b) => {
          const nameA = (a.item_name || '').toLowerCase();
          const nameB = (b.item_name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setLineItems(sortedLineItems);
      }
    } catch (error) {
      console.error("Error fetching line items:", error);
      setLineItems([]);
    } finally {
      setIsLoadingLineItems(false);
    }
  };

  // Fetch line items when invoice details change or view mode changes
  useEffect(() => {
    fetchLineItems(lineItemsViewMode);
  }, [invoiceDetails?.id, lineItemsViewMode]);

  // Calculate and update total amount whenever line items change
  useEffect(() => {
    const calculateTotal = () => {
      const total = lineItems.reduce((sum, item) => {
        const amount = parseFloat(String(item.amount || 0));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Update local invoice details with the new total
      const formattedTotal = total.toFixed(2);
      setLocalInvoiceDetails(prev => ({
        ...prev,
        totalAmount: formattedTotal
      }));

      // Create a synthetic event to update parent state
      const syntheticEvent = {
        target: {
          name: 'totalAmount',
          value: formattedTotal
        }
      } as React.ChangeEvent<HTMLInputElement>;

      onDetailsChange(syntheticEvent);
    };

    if (lineItems.length > 0) {
      calculateTotal();
    }
  }, [lineItems]);



  const handleDateChange = (fieldKey: string, dateString: string | undefined) => {
    // Convert YYYY-MM-DD to ISO string for storage (but keep it as date-only)
    const isoString = dateString ? `${dateString}T00:00:00.000Z` : null;

    setLocalInvoiceDetails(prev => ({
      ...prev,
      [fieldKey]: isoString
    }));

    // Create a synthetic event to maintain compatibility with existing onChange handler
    const syntheticEvent = {
      target: {
        name: fieldKey,
        value: isoString || ''
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onDetailsChange(syntheticEvent);
  };

  // Local state for customer data
  const [customerData, setCustomerData] = useState({
    displayName: localInvoiceDetails.customerData?.displayName || localInvoiceDetails.customerData?.companyName || '',
  });

  // Update customer data when invoice details change
  useEffect(() => {
    if (localInvoiceDetails.customerData) {
      setCustomerData({
        displayName: localInvoiceDetails.customerData.displayName || localInvoiceDetails.customerData.companyName || '',
      });
    }
  }, [localInvoiceDetails.customerData]);

  // Handle customer data changes
  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));

    // Notify parent that there are unsaved changes
    if (onFieldChange) {
      onFieldChange();
    }
  };
  const [vendorData, setVendorData] = useState({
    displayName: localInvoiceDetails.vendorData?.displayName || localInvoiceDetails.vendorData?.companyName || '',
    primaryEmail: localInvoiceDetails.vendorData?.primaryEmail || '',
    primaryPhone: localInvoiceDetails.vendorData?.primaryPhone || '',
    billAddrLine1: localInvoiceDetails.vendorData?.billAddrLine1 || '',
    billAddrCity: localInvoiceDetails.vendorData?.billAddrCity || '',
    billAddrState: localInvoiceDetails.vendorData?.billAddrState || '',
    billAddrPostalCode: localInvoiceDetails.vendorData?.billAddrPostalCode || '',
  });

  // Update vendor data when invoice details change
  useEffect(() => {
    if (localInvoiceDetails.vendorData) {
      setVendorData({
        displayName: localInvoiceDetails.vendorData.displayName || localInvoiceDetails.vendorData.companyName || '',
        primaryEmail: localInvoiceDetails.vendorData.primaryEmail || '',
        primaryPhone: localInvoiceDetails.vendorData.primaryPhone || '',
        billAddrLine1: localInvoiceDetails.vendorData.billAddrLine1 || '',
        billAddrCity: localInvoiceDetails.vendorData.billAddrCity || '',
        billAddrState: localInvoiceDetails.vendorData.billAddrState || '',
        billAddrPostalCode: localInvoiceDetails.vendorData.billAddrPostalCode || '',
      });
    }
  }, [localInvoiceDetails.vendorData]);

  // Handle vendor data changes
  const handleVendorDataChange = (field: string, value: string) => {
    setVendorData(prev => ({ ...prev, [field]: value }));

    // Notify parent that there are unsaved changes
    if (onFieldChange) {
      onFieldChange();
    }
  };

  const allFields = Object.keys(invoiceDetails || {});

  const hiddenFields = [
    "id",
    "userId",
    "attachmentId",
    "createdAt",
    "updatedAt",
    "status",
    "fileUrl",
    "fileKey",
    "sourcePdfUrl",
    "s3JsonKey",
    "isDeleted",
    "deletedAt",
    'vendorId',
    'vendorData',
    'customerId',
    'customerData',
    'vendorAddress',
    'vendorPhone',
    'vendorEmail',
    'rejectionEmailSender',
    'rejectionReason',
    'senderEmail'
  ];
  const fieldsToDisplay = allFields.filter(key => !hiddenFields.includes(key));

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Duplicate Invoice Warning Banner */}
      {invoiceDetails.isDuplicate && (
        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-3 flex-col items-start gap-3 dark:bg-orange-950 dark:border-orange-700">
          <div className="flex items-end gap-1">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
              Duplicate Invoice Detected
            </h3>
          </div>
          <p className="text-orange-700 dark:text-orange-400 text-xs mt-2">
            This invoice has the same invoice number and vendor as another invoice in the system.
            Please change the invoice number to remove this warning and enable approval.
          </p>
        </div>
      )}

      {/* Accordion Sections */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="h-full flex flex-col gap-2"
        >
          {/* Section 1: Invoice Information - 50% height when expanded */}
          <AccordionItem value="invoice-info" className="border rounded-lg bg-card flex-1 min-h-0 flex flex-col data-[state=closed]:flex-none overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:no-underline border-b flex-shrink-0">
              <span className="text-sm font-semibold">Invoice Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3 flex-1 min-h-0 overflow-hidden data-[state=open]:flex data-[state=open]:flex-col h-full">
              <ScrollArea className="flex-1 pr-2 h-full">
                <div className="space-y-2.5 py-2">
                  {/* Highlighted Fields - At the Top */}
                  <FormField
                    key="invoiceNumber"
                    fieldKey="invoiceNumber"
                    label="Invoice Number"
                    value={localInvoiceDetails.invoiceNumber ?? null}
                    isEditing={!isInvoiceFinalized}
                    onChange={onDetailsChange}
                    onDateChange={handleDateChange}
                    highlighted={true}
                  />

                  <FormField
                    key="totalAmount"
                    fieldKey="totalAmount"
                    label="Total Amount"
                    value={localInvoiceDetails.totalAmount ?? null}
                    isEditing={!isInvoiceFinalized}
                    onChange={onDetailsChange}
                    onDateChange={handleDateChange}
                    highlighted={true}
                  />

                  <FormField
                    key="totalQuantity"
                    fieldKey="totalQuantity"
                    label="Total Quantity"
                    value={localInvoiceDetails.totalQuantity ?? null}
                    isEditing={!isInvoiceFinalized}
                    onChange={onDetailsChange}
                    onDateChange={handleDateChange}
                    highlighted={true}
                  />

                  <FormField
                    key="totalTax"
                    fieldKey="totalTax"
                    label="Total Tax"
                    value={localInvoiceDetails.totalTax ?? null}
                    isEditing={!isInvoiceFinalized}
                    onChange={onDetailsChange}
                    onDateChange={handleDateChange}
                    highlighted={true}
                  />

                  <FormField
                    key="invoiceDate"
                    fieldKey="invoiceDate"
                    label="Invoice Date"
                    value={localInvoiceDetails.invoiceDate ?? null}
                    isEditing={!isInvoiceFinalized}
                    onChange={onDetailsChange}
                    onDateChange={handleDateChange}
                    highlighted={true}
                  />

                  {/* Vendor Information Section */}
                  <div className="space-y-1">
                    <Label htmlFor="vendorName" className="text-xs font-medium">
                      Vendor Name
                    </Label>
                    <Input
                      id="vendorName"
                      name="vendorName"
                      value={vendorData.displayName}
                      onChange={(e) => handleVendorDataChange('displayName', e.target.value)}
                      placeholder="Enter vendor name"
                      className="h-8 read-only:cursor-not-allowed read-only:bg-muted"
                      readOnly={isInvoiceFinalized}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="vendorEmail" className="text-xs font-medium">
                      Vendor Email
                    </Label>
                    <Input
                      id="vendorEmail"
                      name="vendorEmail"
                      type="email"
                      value={vendorData.primaryEmail}
                      onChange={(e) => handleVendorDataChange('primaryEmail', e.target.value)}
                      placeholder="Enter vendor email"
                      className="h-8 read-only:cursor-not-allowed read-only:bg-muted"
                      readOnly={isInvoiceFinalized}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="vendorPhone" className="text-xs font-medium">
                      Vendor Phone
                    </Label>
                    <Input
                      id="vendorPhone"
                      name="vendorPhone"
                      type="tel"
                      value={vendorData.primaryPhone}
                      onChange={(e) => handleVendorDataChange('primaryPhone', e.target.value)}
                      placeholder="Enter vendor phone"
                      className="h-8 read-only:cursor-not-allowed read-only:bg-muted"
                      readOnly={isInvoiceFinalized}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="vendorAddress" className="text-xs font-medium">
                      Vendor Address
                    </Label>
                    <Input
                      id="vendorAddress"
                      name="vendorAddress"
                      value={vendorData.billAddrLine1}
                      onChange={(e) => handleVendorDataChange('billAddrLine1', e.target.value)}
                      placeholder="Enter vendor address"
                      className="h-8 read-only:cursor-not-allowed read-only:bg-muted"
                      readOnly={isInvoiceFinalized}
                    />
                  </div>

                  {/* Customer Name Field */}
                  {localInvoiceDetails.customerData && (
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="text-xs font-medium">
                        Customer Name
                      </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={customerData.displayName}
                        onChange={(e) => handleCustomerDataChange('displayName', e.target.value)}
                        placeholder="Enter customer name"
                        className="h-8 read-only:cursor-not-allowed read-only:bg-muted"
                        readOnly={isInvoiceFinalized}
                      />
                    </div>
                  )}

                  {/* Rest of the fields (excluding highlighted fields since they're shown at top) */}
                  {fieldsToDisplay
                    .filter(key => !['invoiceNumber', 'totalAmount', 'totalQuantity', 'totalTax', 'invoiceDate'].includes(key)) // Exclude highlighted fields since they're shown at top
                    .map((key) => {
                      const value = localInvoiceDetails[key as keyof InvoiceDetails];
                      // Skip if the value is an object (like vendorData)
                      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return null;
                      }

                      return (
                        <FormField
                          key={key}
                          fieldKey={key}
                          label={formatLabel(key)}
                          value={value ?? null}
                          isEditing={!isInvoiceFinalized}
                          onChange={onDetailsChange}
                          onDateChange={handleDateChange}
                          highlighted={false}
                        />
                      );
                    })}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Line Items - 50% height when expanded */}
          <AccordionItem value="line-items" className="border rounded-lg bg-card flex-1 min-h-0 flex flex-col data-[state=closed]:flex-none overflow-hidden">
            <div className="relative">
              <AccordionTrigger className="px-4 py-2 hover:no-underline border-b flex-shrink-0">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-semibold">Line Items ({lineItems.length})</span>
                </div>
                {isLoadingLineItems && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </AccordionTrigger>
              {/* View toggle moved outside AccordionTrigger to avoid nested buttons */}
              <div className="absolute left-[140px] top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                <span className="text-xs text-muted-foreground">View:</span>
                <div className="flex items-center bg-muted rounded-md p-1">
                  <button
                    type="button"
                    onClick={() => setLineItemsViewMode('single')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${lineItemsViewMode === 'single'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineItemsViewMode('expand')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${lineItemsViewMode === 'expand'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Expand
                  </button>
                </div>
              </div>
              {/* Move buttons outside of AccordionTrigger */}
              {selectedLineItems.size > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 bg-card px-2 py-1 rounded">
                  <span className="text-xs text-muted-foreground">({selectedLineItems.size} selected)</span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChangeTypeDialog(true);
                    }}
                  >
                    Change Type
                  </Button>
                </div>
              )}
            </div>
            <AccordionContent className="px-2 pb-3 flex-1 min-h-0 overflow-hidden data-[state=open]:flex data-[state=open]:flex-col h-full">
              <div className="flex flex-col flex-1 min-h-0 h-full">
                <ScrollArea className="flex-1">
                  {isLoadingLineItems ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : (
                    <LineItemsTable
                      key={lineItems.map(item => `${item.id}-${item.itemType}-${item.resourceId}`).join(',')}
                      lineItems={lineItems}
                      onUpdate={handleLineItemUpdate}
                      onChange={handleLineItemChange}
                      onDelete={handleLineItemDelete}
                      isEditing={!isInvoiceFinalized}
                      isQuickBooksConnected={isQuickBooksConnected}
                      selectedItems={selectedLineItems}
                      onSelectionChange={setSelectedLineItems}
                      viewMode={lineItemsViewMode}
                      invoiceDetails={invoiceDetails}
                      onLineItemsRefresh={() => fetchLineItems(lineItemsViewMode)}
                      onSingleModeSaveRef={singleModeSaveRef}
                    />
                  )}
                </ScrollArea>

                {/* Add Line Item Button - Only show in expand mode */}
                {invoiceDetails?.id && lineItemsViewMode === 'expand' && (
                  <div className="mt-2 flex-shrink-0">
                    <AddLineItemDialog
                      invoiceId={invoiceDetails.id}
                      onLineItemAdded={handleLineItemAdded}
                      isQuickBooksConnected={isQuickBooksConnected}
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Section 3: Action Buttons - Fixed at Bottom */}
      <div className="flex-shrink-0">
        <ConfirmationModals
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          invoiceDetails={invoiceDetails}
          originalInvoiceDetails={originalInvoiceDetails}
          selectedFields={selectedFields}
          onSave={onSave}
          onReject={onReject}
          onApprove={onApprove}
          onCancel={onCancel}
          onApprovalSuccess={onApprovalSuccess}
          onInvoiceDetailsUpdate={onInvoiceDetailsUpdate}
          onFieldChange={onFieldChange}
          vendorData={vendorData}
          customerData={customerData}
          lineItemsViewMode={lineItemsViewMode}
          singleModeSaveRef={singleModeSaveRef}
          isDuplicate={invoiceDetails.isDuplicate}
        />
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteLineItems}
        title="Delete Line Items"
        description={`Are you sure you want to delete ${selectedLineItems.size} selected line item(s)? This action cannot be undone.`}
        isDeleting={isDeleting}
        confirmText="Delete"
      />

      <Dialog
        open={showChangeTypeDialog}
        onOpenChange={(open) => {
          setShowChangeTypeDialog(open);
          if (open) {
            // Ensure line-items accordion stays open when dialog opens
            setAccordionValue(prev => {
              if (!prev.includes("line-items")) {
                return [...prev, "line-items"];
              }
              return prev;
            });
            loadCustomers();
            if (bulkItemType) {
              if (bulkItemType === 'account' && bulkAccounts.length === 0) {
                loadBulkAccounts();
              } else if (bulkItemType === 'product' && bulkItems.length === 0) {
                loadBulkItems();
              }
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Cost Type</DialogTitle>
            <DialogDescription>
              Select the item type and category to apply to {selectedLineItems.size} selected line item(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cost Type</Label>
              <Select
                value={bulkItemType || ""}
                onValueChange={(value) => {
                  const newType = value as 'account' | 'product';
                  setBulkItemType(newType);
                  setBulkResourceId(null);
                  if (newType === 'account' && bulkAccounts.length === 0) {
                    loadBulkAccounts();
                  } else if (newType === 'product' && bulkItems.length === 0) {
                    loadBulkItems();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Indirect</SelectItem>
                  <SelectItem value="product">Job Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkItemType && (
              <div className="space-y-2">
                <Label>{bulkItemType === 'account' ? 'Indirect' : 'Job Cost'}</Label>
                {bulkItemType === 'account' ? (
                  <EnhancedLineItemAutocomplete
                    items={bulkAccounts}
                    value={bulkResourceId}
                    onSelect={(id, account) => {
                      // Store quickbooks_id in state for UI matching
                      const quickbooksId = account?.quickbooksId || null;
                      setBulkResourceId(quickbooksId);
                    }}
                    placeholder="Search accounts..."
                    isLoading={isLoadingBulkData}
                    getDisplayName={(account: any) =>
                      account.fullyQualifiedName || account.name || 'Unknown Account'
                    }
                    showAddOption={true}
                    addOptionLabel="Add Account"
                    onAddClick={() => setAddAccountModalOpen(true)}
                  />
                ) : (
                  <EnhancedLineItemAutocomplete
                    items={bulkItems}
                    value={bulkResourceId}
                    onSelect={(id, item) => {
                      // Store quickbooks_id in state for UI matching
                      const quickbooksId = item?.quickbooksId || null;
                      setBulkResourceId(quickbooksId);
                    }}
                    placeholder="Search job costs..."
                    isLoading={isLoadingBulkData}
                    getDisplayName={(item: any) =>
                      item.fullyQualifiedName || item.name || 'Unknown Product'
                    }
                    showAddOption={true}
                    addOptionLabel="Add Product"
                    onAddClick={() => setAddProductModalOpen(true)}
                  />
                )}
              </div>
            )}

            {/* Job Dropdown */}
            <div className="space-y-2">
              <Label>Job (Optional)</Label>
              <EnhancedLineItemAutocomplete
                items={bulkCustomers}
                value={bulkCustomerId}
                onSelect={(id, customer) => {
                  // Store quickbooksId for customers (they use quickbooksId field)
                  const quickbooksId = customer?.quickbooksId || null;
                  setBulkCustomerId(quickbooksId);
                }}
                placeholder="Search jobs..."
                isLoading={isLoadingCustomers}
                getDisplayName={(customer: QuickBooksCustomer) => {
                  const name = customer.displayName || customer.companyName || `Customer ${customer.quickbooksId}`;
                  return name;
                }}
                showAddOption={true}
                addOptionLabel="Add Customer"
                onAddClick={() => setAddCustomerModalOpen(true)}
              />
              {bulkCustomers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {bulkCustomers.length} jobs available
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This job will be applied to all selected line items
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangeTypeDialog(false);
                setBulkItemType(null);
                setBulkResourceId(null);
                setBulkCustomerId(null);
              }}
              disabled={isApplyingBulkChange}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyBulkChange}
              disabled={!bulkItemType || isApplyingBulkChange}
            >
              {isApplyingBulkChange ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply to Selected'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal for Bulk Actions */}
      <AddCustomerModal
        isOpen={addCustomerModalOpen}
        onClose={() => setAddCustomerModalOpen(false)}
        onCustomerCreated={handleBulkCustomerCreated}
      />

      {/* Add Product Modal for Bulk Actions */}
      <AddProductModal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        onProductCreated={handleBulkProductCreated}
      />

      {/* Add Account Modal for Bulk Actions */}
      <AddAccountModal
        isOpen={addAccountModalOpen}
        onClose={() => setAddAccountModalOpen(false)}
        onAccountCreated={handleBulkAccountCreated}
      />
    </div >
  );
}

