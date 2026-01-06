"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { client } from "@/lib/axios-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { InvoiceDetails } from "@/lib/types/invoice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

// Categorized rejection reasons
const REJECTION_REASONS = {
  "Administrative": [
    "Missing required invoice information",
    "Incorrect billing entity",
    "Incorrect project name or job number",
    "Missing or incorrect PO number",
    "Duplicate invoice",
    "Math or calculation error",
    "Invoice format not compliant with requirements",
  ],
  "Delivery": [
    "Missing delivery tickets or packing slips",
    "Unsigned or unverified delivery documentation",
    "Quantities billed exceed quantities delivered",
    "Materials not received",
    "Returned or rejected materials not credited",
    "Delivery dates do not match invoice",
  ],
  "Field": [
    "Work not verified or approved by field",
    "Materials rejected by field or inspection",
    "Punchlist or corrective work outstanding",
    "Backcharges pending",
    "Scope incomplete or disputed",
  ],
};
import { formatLabel, renderValue, formatDate } from "@/lib/utility/formatters";
import { X } from "lucide-react";

// Zod schema for rejection form with multiple emails
const rejectionFormSchema = z.object({
  emails: z.array(z.string().email("Invalid email address")).min(1, "At least one email is required"),
  reason: z.string().min(1, "Reason is required").min(10, "Reason must be at least 10 characters"),
});

// Helper to validate a single email
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to capitalize status
const capitalizeStatus = (status: string | null | undefined): string => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Helper function to detect automated/no-reply email addresses
const isAutomatedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  const automatedPatterns = [
    'noreply',
    'no-reply',
    'no_reply',
    'donotreply',
    'do-not-reply',
    'do_not_reply',
    'notification',
    'notifications',
    'alert',
    'alerts',
    'system',
    'auto',
    'automated',
  ];
  return automatedPatterns.some(pattern => lowerEmail.includes(pattern));
};

interface ConfirmationModalsProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  invoiceDetails: InvoiceDetails;
  originalInvoiceDetails: InvoiceDetails;
  selectedFields: string[];
  onSave: (vendorData?: any, customerData?: any) => Promise<void>;
  onReject: () => Promise<void>;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  onApprovalSuccess?: () => void;
  onInvoiceDetailsUpdate?: (updatedDetails: InvoiceDetails) => void;
  onFieldChange?: () => void;
  vendorData?: any;
  customerData?: any;
  lineItemsViewMode?: 'single' | 'expand';
  singleModeSaveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  isDuplicate?: boolean;
}

export default function ConfirmationModals({
  invoiceDetails,
  selectedFields,
  onSave,
  onApprovalSuccess,
  onInvoiceDetailsUpdate,
  vendorData,
  customerData,
  lineItemsViewMode,
  singleModeSaveRef,
  isDuplicate = false,
}: ConfirmationModalsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isQuickBooksErrorOpen, setIsQuickBooksErrorOpen] = useState(false);
  const [isLineItemsErrorOpen, setIsLineItemsErrorOpen] = useState(false);
  const [incompleteLineItems, setIncompleteLineItems] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [skipEmail, setSkipEmail] = useState(false);
  const [formErrors, setFormErrors] = useState<{ emails?: string; reason?: string }>({});
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailInputValue, setEmailInputValue] = useState("");
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get available email suggestions (vendor and sender emails not already selected)
  const getAvailableEmailSuggestions = () => {
    const suggestions: { email: string; label: string; isAutomated: boolean }[] = [];

    if (invoiceDetails.senderEmail && !selectedEmails.includes(invoiceDetails.senderEmail)) {
      suggestions.push({
        email: invoiceDetails.senderEmail,
        label: `Sender: ${invoiceDetails.senderEmail}`,
        isAutomated: isAutomatedEmail(invoiceDetails.senderEmail),
      });
    }

    const vendorEmail = vendorData?.primaryEmail;
    if (vendorEmail && !selectedEmails.includes(vendorEmail) && vendorEmail !== invoiceDetails.senderEmail) {
      suggestions.push({
        email: vendorEmail,
        label: `Vendor: ${vendorEmail}`,
        isAutomated: isAutomatedEmail(vendorEmail),
      });
    }

    return suggestions;
  };

  // Handle adding an email
  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && isValidEmail(trimmedEmail) && !selectedEmails.includes(trimmedEmail)) {
      setSelectedEmails([...selectedEmails, trimmedEmail]);
      setEmailInputValue("");
      setFormErrors((prev) => ({ ...prev, emails: undefined }));
    } else if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setFormErrors((prev) => ({ ...prev, emails: "Please enter a valid email address" }));
    }
  };

  // Handle removing an email
  const removeEmail = (emailToRemove: string) => {
    setSelectedEmails(selectedEmails.filter((email) => email !== emailToRemove));
  };

  // Handle keyboard events in email input
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      if (emailInputValue.trim()) {
        addEmail(emailInputValue);
      }
    } else if (e.key === "Backspace" && !emailInputValue && selectedEmails.length > 0) {
      // Remove last email when backspace is pressed on empty input
      const lastEmail = selectedEmails[selectedEmails.length - 1];
      if (lastEmail) {
        removeEmail(lastEmail);
      }
    }
  };

  // Handle input blur
  const handleEmailBlur = () => {
    // Add email if there's text in the input
    if (emailInputValue.trim()) {
      addEmail(emailInputValue);
    }
    // Delay hiding dropdown to allow click events to fire
    setTimeout(() => setShowEmailDropdown(false), 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target as Node)
      ) {
        setShowEmailDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    // Skip all validation if skipEmail is checked (reason is optional)
    if (skipEmail) {
      setFormErrors({});
      return true;
    }

    const result = rejectionFormSchema.safeParse({ emails: selectedEmails, reason: rejectionReason });

    if (!result.success) {
      const errors: { emails?: string; reason?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "emails") errors.emails = err.message;
        if (err.path[0] === "reason") errors.reason = err.message;
      });
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    // If in single mode and single mode save function is available, call it first
    if (lineItemsViewMode === 'single' && singleModeSaveRef?.current) {
      try {
        await singleModeSaveRef.current();
      } catch (error) {
        console.error('Error saving single mode data:', error);
        // Continue with regular save even if single mode save fails
      }
    }

    await onSave(vendorData, customerData);
    setIsSaving(false);
  };

  const handleReopenForReview = async () => {
    setIsReopening(true);
    try {
      const invoiceId = invoiceDetails.id;
      const statusUpdateResponse: any = await client.patch(`/api/v1/invoice/${invoiceId}/status`, {
        status: "pending"
      });

      if (onInvoiceDetailsUpdate && statusUpdateResponse.success) {
        const updatedDetails = { ...invoiceDetails, status: "pending" };
        onInvoiceDetailsUpdate(updatedDetails as InvoiceDetails);
      }

      toast.success("Invoice reopened for review");
    } catch (error: any) {
      console.error("Error reopening invoice:", error);
      toast.error("Failed to reopen invoice", {
        description: error.response?.data?.error || error.message
      });
    }
    setIsReopening(false);
  };

  const checkQuickBooksIntegration = async (): Promise<boolean> => {
    try {
      const response: any = await client.get('/api/v1/quickbooks/status');
      return response?.data?.connected === true;
    } catch (error) {
      console.error('Error checking QuickBooks integration:', error);
      return false;
    }
  };

  const validateLineItems = async (): Promise<{ isValid: boolean; incompleteItems: string[] }> => {
    try {
      const invoiceId = invoiceDetails.id;
      if (!invoiceId) {
        return { isValid: true, incompleteItems: [] };
      }

      // Determine which line items to validate based on current view mode
      const viewTypeToCheck = lineItemsViewMode === 'single' ? 'single' : 'expanded';

      // Fetch line items from database based on current view mode
      const response: any = await client.get(`/api/v1/invoice/line-items/invoice/${invoiceId}?viewType=${viewTypeToCheck}`);

      if (!response.success || !response.data) {
        return { isValid: true, incompleteItems: [] };
      }

      const lineItems = response.data;
      const incompleteItems: string[] = [];

      // If in single mode and no single line item exists, it's invalid
      if (lineItemsViewMode === 'single' && lineItems.length === 0) {
        return {
          isValid: false,
          incompleteItems: ['Single line item not configured. Please configure Cost Type and Category in single mode.']
        };
      }

      // Check each line item for missing itemType or resourceId
      lineItems.forEach((item: any) => {
        const hasItemType = item.itemType && (item.itemType === 'account' || item.itemType === 'product');
        const hasResourceId = item.resourceId && item.resourceId.trim() !== '';

        if (!hasItemType || !hasResourceId) {
          const itemName = item.item_name || item.description || `Line Item ${item.id}`;
          incompleteItems.push(itemName);
        }
      });

      const isValid = incompleteItems.length === 0;

      return {
        isValid,
        incompleteItems
      };
    } catch (error) {
      console.error('Error validating line items:', error);
      return { isValid: true, incompleteItems: [] }; // Allow approval if validation fails
    }
  };

  const handleApproveClick = async () => {
    // Step 0: Auto-save if there are unsaved changes (check if onFieldChange was called)
    // We'll always save before approval to ensure latest changes are persisted
    setIsSaving(true);

    // If in single mode and single mode save function is available, call it first
    if (lineItemsViewMode === 'single' && singleModeSaveRef?.current) {
      try {
        await singleModeSaveRef.current();
      } catch (error) {
        console.error('Error saving single mode data:', error);
        // Continue with regular save even if single mode save fails
      }
    }

    await onSave(vendorData, customerData);
    setIsSaving(false);

    // Step 1: Validate line items first
    const { isValid, incompleteItems } = await validateLineItems();
    if (!isValid) {
      setIncompleteLineItems(incompleteItems);
      setIsLineItemsErrorOpen(true);
      return;
    }

    // Step 2: Check QuickBooks integration
    const isConnected = await checkQuickBooksIntegration();
    if (!isConnected) {
      setIsQuickBooksErrorOpen(true);
      return;
    }

    // Step 3: Proceed with approval
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = async () => {
    setIsApproving(true);

    try {
      // Step 1: Get line items from database using invoice ID based on current view mode
      const invoiceId = invoiceDetails.id;
      if (!invoiceId) {
        throw new Error("Invoice ID not found");
      }

      // Use the appropriate line items based on current view mode
      const viewTypeToUse = lineItemsViewMode === 'single' ? 'single' : 'expanded';
      const dbLineItemsResponse: any = await client.get(`/api/v1/invoice/line-items/invoice/${invoiceId}?viewType=${viewTypeToUse}`);

      if (dbLineItemsResponse.success && dbLineItemsResponse.data.length > 0) {
        const lineItems = dbLineItemsResponse.data;
        const totalAmountFromPopup = parseFloat(invoiceDetails?.totalAmount ?? "0") || 0;
        const lineItemsSum = lineItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
        const discountAmount = lineItemsSum - totalAmountFromPopup;
        let vendorId = invoiceDetails?.vendorData?.quickbooksId;

        const totalTaxAmount = parseFloat(invoiceDetails?.totalTax ?? "0") || 0;

        // Only create vendor in QuickBooks if it's a local vendor (starts with "LOCAL_")
        // If we already have a real QuickBooks vendor ID, use it directly
        if (vendorId && vendorId.startsWith("LOCAL_")) {
          console.log("Local vendor detected, creating in QuickBooks first...");

          try {
            // Create vendor in QuickBooks first
            const createVendorResponse = await client.post("/api/v1/quickbooks/create-vendor", {
              name: invoiceDetails?.vendorData?.displayName || invoiceDetails?.vendorData?.companyName || "Unknown Vendor",
              email: invoiceDetails?.vendorData?.primaryEmail || undefined,
              phone: invoiceDetails?.vendorData?.primaryPhone || undefined,
              address: invoiceDetails?.vendorData?.billAddrLine1 || undefined,
            });

            // Handle different response formats from QuickBooks API
            let newQuickBooksVendorId = null;

            if (createVendorResponse.data?.success) {
              // Try different response paths for both newly created and existing vendors
              if (createVendorResponse.data?.vendor?.QueryResponse?.Vendor?.[0]?.Id) {
                // This handles both new vendor creation and existing vendor return
                newQuickBooksVendorId = createVendorResponse.data.vendor.QueryResponse.Vendor[0].Id;
              } else if (createVendorResponse.data?.vendor?.Vendor?.Id) {
                // Alternative format for direct vendor creation
                newQuickBooksVendorId = createVendorResponse.data.vendor.Vendor.Id;
              } else if (createVendorResponse.data?.data?.QueryResponse?.Vendor?.[0]?.Id) {
                // Another possible response format
                newQuickBooksVendorId = createVendorResponse.data.data.QueryResponse.Vendor[0].Id;
              }
            }

            if (newQuickBooksVendorId) {
              // Update the vendorId to use the new QuickBooks vendor ID
              vendorId = newQuickBooksVendorId;
              console.log(`Created vendor in QuickBooks with ID: ${vendorId}`);

              // Optional: Update the local vendor record with the real QuickBooks ID
              // This prevents creating the same vendor multiple times in QuickBooks
              try {
                await client.patch(`/api/v1/vendors/${invoiceDetails?.vendorData?.id}`, {
                  quickbooksId: newQuickBooksVendorId
                });
              } catch (updateError) {
                console.warn("Failed to update local vendor with QuickBooks ID:", updateError);
                // Don't fail the bill creation if local update fails
              }
            } else {
              console.error("Vendor creation response:", createVendorResponse.data);
              throw new Error("Failed to create vendor in QuickBooks - no ID returned in response");
            }
          } catch (vendorError: any) {
            console.error("Error creating vendor in QuickBooks:", vendorError);

            // Show specific error for vendor creation failure
            toast.dismiss();
            toast.error("Vendor Creation Failed", {
              description: `Cannot create bill: ${vendorError.response?.data?.error || vendorError.message || 'Failed to create vendor in QuickBooks'}`,
              duration: 7000,
            });
            setIsDialogOpen(false);
            setIsApproving(false);
            return;
          }
        } else if (!vendorId) {
          // If no vendor ID at all, show error
          toast.dismiss();
          toast.error("Vendor Missing", {
            description: "No vendor information found for this invoice. Cannot create bill in QuickBooks.",
            duration: 7000,
          });
          setIsDialogOpen(false);
          setIsApproving(false);
          return;
        }
        // If vendorId exists and doesn't start with "LOCAL_", it's already a valid QuickBooks ID - use it directly

        try {
          await client.post("/api/v1/quickbooks/create-bill", {
            vendorId: vendorId,
            lineItems: lineItems,
            totalAmount: totalAmountFromPopup,
            ...(totalTaxAmount > 0 && { totalTax: totalTaxAmount }),
            dueDate: invoiceDetails.dueDate,
            invoiceDate: invoiceDetails.invoiceDate,
            // Add discount if there's a positive difference (line items > total)
            ...(discountAmount > 0 && {
              discountAmount: discountAmount,
              discountDescription: "Invoice Discount"
            }),
            // Include PDF attachment URL
            attachmentUrl: invoiceDetails.fileUrl || invoiceDetails.sourcePdfUrl,
            invoiceNumber: invoiceDetails.invoiceNumber
          });

        } catch (error: any) {
          // Extract error message from API response
          let errorMessage = "Unable to create bill in QuickBooks. Please try again";

          if (error.response?.data?.error?.message) {
            // Format: { error: { message: "..." } }
            errorMessage = error.response.data.error.message;
          } else if (error.response?.data?.message) {
            // Format: { message: "..." }
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            // Format: { error: "..." }
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }

          toast.dismiss();
          toast.error("Bill Creation Failed", {
            description: errorMessage,
            duration: 7000,
          });
          setIsDialogOpen(false);
          setIsApproving(false);
          return;
        }


        // Step 6: Update invoice status to approved
        const statusUpdateResponse: any = await client.patch(`/api/v1/invoice/${invoiceId}/status`, {
          status: "approved"
        });

        // Update local invoice details state
        if (onInvoiceDetailsUpdate && statusUpdateResponse.success) {
          const updatedDetails = { ...invoiceDetails, status: "approved" };
          onInvoiceDetailsUpdate(updatedDetails as InvoiceDetails);
        }

        toast.dismiss();
        toast.success("Invoice approved and bill created in QuickBooks successfully!");

        // Close the dialog first
        setIsDialogOpen(false);

        // Call success callback to close popup and refetch
        if (onApprovalSuccess) {
          onApprovalSuccess();
        }
      } else {
        throw new Error("No line items found for this invoice");
      }
    } catch (error: any) {
      console.error("Error in approval process:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      // Extract error message from various possible formats
      let errorMessage = "Failed to process invoice approval";

      if (error.response?.data?.error) {
        // Format: { error: "message" }
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // Format: { message: "message" }
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        // Format: "error message"
        errorMessage = error.response.data;
      } else if (error.message) {
        // Format: Error object with message
        errorMessage = error.message;
      }

      // Show error toast with specific message
      toast.dismiss();
      toast.error("Approval Failed", {
        description: errorMessage,
        duration: 5000,
      });

      // Close the dialog so user can try again
      setIsDialogOpen(false);
    }

    setIsApproving(false);
  };

  const handleConfirmReject = async () => {
    // Validate form using Zod
    if (!validateForm()) {
      return;
    }

    setIsRejecting(true);

    try {
      // Save invoice changes first (including single mode if applicable)
      // If in single mode and single mode save function is available, call it first
      if (lineItemsViewMode === 'single' && singleModeSaveRef?.current) {
        try {
          await singleModeSaveRef.current();
        } catch (error) {
          console.error('Error saving single mode data:', error);
          // Continue with regular save even if single mode save fails
        }
      }

      await onSave(vendorData, customerData);

      const invoiceId = invoiceDetails.id;

      // Update invoice status to rejected with reason and recipient emails
      const statusUpdateResponse: any = await client.patch(`/api/v1/invoice/${invoiceId}/status`, {
        status: "rejected",
        ...(rejectionReason && { rejectionReason }),
        ...(selectedEmails.length > 0 && { recipientEmails: selectedEmails }),
      });

      // Update local invoice details state
      if (onInvoiceDetailsUpdate && statusUpdateResponse.success) {
        const updatedDetails = { ...invoiceDetails, status: "rejected" };
        onInvoiceDetailsUpdate(updatedDetails as InvoiceDetails);
      }

      toast.dismiss();
      const emailCount = selectedEmails.length;
      toast.success(skipEmail ? "Invoice rejected" : `Invoice rejected. Notification sent to ${emailCount} recipient${emailCount > 1 ? 's' : ''}`);

      // Close the dialog and reset form
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSkipEmail(false);
      setSelectedEmails([]);
      setEmailInputValue("");
      setFormErrors({});

    } catch (error: any) {
      console.error("Error rejecting invoice:", error.response?.data || error.message);

      const errorMessage = error.response?.data?.error || error.message || "Failed to reject invoice";
      toast.dismiss();
      toast.error("Rejection Failed", {
        description: errorMessage
      });
    }

    setIsRejecting(false);
  };

  // Check if invoice is already approved or rejected
  const isInvoiceFinalized = invoiceDetails.status === "approved" || invoiceDetails.status === "rejected";

  const handleRejectClick = () => {
    // Reset form state and open the reject dialog
    setRejectionReason("");
    setSkipEmail(false);
    setSelectedEmails([]);
    setEmailInputValue("");
    setFormErrors({});
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="flex justify-between mt-4">
      <div className="flex gap-2">
        {isInvoiceFinalized ? (
          <Button onClick={handleReopenForReview} disabled={isReopening} variant="outline">
            {isReopening ? "Reopening..." : "Reopen for Review"}
          </Button>
        ) : (
          <Button onClick={handleSaveChanges} disabled={isSaving} variant="outline">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>
      {!isInvoiceFinalized && (
        <div className="flex gap-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <Button
              onClick={handleRejectClick}
              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
              disabled={isRejecting || isSaving}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Reject Invoice</DialogTitle>
                <DialogDescription>
                  This will mark the invoice as rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipEmail"
                    checked={skipEmail}
                    onCheckedChange={(checked) => {
                      setSkipEmail(checked === true);
                      if (checked) {
                        setFormErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                  />
                  <Label htmlFor="skipEmail" className="text-sm font-medium cursor-pointer">
                    Don't send rejection email
                  </Label>
                </div>
                {!skipEmail && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Send email to <span className="text-red-500">*</span>
                    </Label>
                    {formErrors.emails && (
                      <p className="text-red-500 text-xs">{formErrors.emails}</p>
                    )}
                    <div className="relative">
                      <div
                        className={`flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px] cursor-text ${formErrors.emails ? "border-red-500" : "border-input"} focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2`}
                        onClick={() => emailInputRef.current?.focus()}
                      >
                        {/* Email chips/tags */}
                        {selectedEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(email);
                              }}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {/* Input field */}
                        <input
                          ref={emailInputRef}
                          type="text"
                          value={emailInputValue}
                          onChange={(e) => {
                            setEmailInputValue(e.target.value);
                            setFormErrors((prev) => ({ ...prev, emails: undefined }));
                          }}
                          onKeyDown={handleEmailKeyDown}
                          onFocus={() => setShowEmailDropdown(true)}
                          onBlur={handleEmailBlur}
                          placeholder={selectedEmails.length === 0 ? "Type email or select from suggestions" : ""}
                          className="flex-1 min-w-[180px] outline-none bg-transparent text-sm"
                        />
                      </div>

                      {/* Dropdown suggestions */}
                      {showEmailDropdown && getAvailableEmailSuggestions().length > 0 && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md py-1"
                        >
                          {getAvailableEmailSuggestions().map((suggestion) => (
                            <button
                              key={suggestion.email}
                              type="button"
                              disabled={suggestion.isAutomated}
                              onClick={() => {
                                if (!suggestion.isAutomated) {
                                  addEmail(suggestion.email);
                                  emailInputRef.current?.focus();
                                }
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${suggestion.isAutomated
                                ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                : "hover:bg-accent cursor-pointer"
                                }`}
                              title={suggestion.isAutomated ? "This appears to be an automated email address that cannot receive replies" : ""}
                            >
                              {suggestion.label}
                              {suggestion.isAutomated && (
                                <span className="ml-2 text-xs text-muted-foreground">(automated)</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter or comma to add multiple emails
                    </p>
                  </div>
                )}
                {!skipEmail && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Reason for rejection <span className="text-red-500">*</span>
                    </Label>
                    {formErrors.reason && (
                      <p className="text-red-500 text-xs">{formErrors.reason}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(REJECTION_REASONS).map(([category, reasons]) => (
                        <Select
                          key={category}
                          value=""
                          onValueChange={(value) => {
                            if (value) {
                              setRejectionReason((prev) => {
                                if (!prev) return value;
                                // Check if reason already exists
                                const existingReasons = prev.split(", ").map(r => r.trim());
                                if (existingReasons.includes(value)) return prev;
                                return `${prev}, ${value}`;
                              });
                              setFormErrors((prev) => ({ ...prev, reason: undefined }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-auto min-h-[36px] text-xs px-2">
                            <SelectValue placeholder={category} />
                          </SelectTrigger>
                          <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                            {reasons.map((reason) => (
                              <SelectItem
                                key={reason}
                                value={reason}
                                className="text-xs"
                                title={reason}
                              >
                                <span className="truncate" title={reason}>
                                  {reason}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setFormErrors((prev) => ({ ...prev, reason: undefined }));
                      }}
                      placeholder="Select reasons above or type custom reason..."
                      className={`w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none ${formErrors.reason ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleConfirmReject}
                  disabled={isRejecting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${isDuplicate && "cursor-not-allowed"}`}>
                  <Button
                    onClick={handleApproveClick}
                    className={`bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 ${isDuplicate && "bg-gray-400 hover:bg-gray-600"}`}
                    disabled={isApproving || isSaving || isDuplicate}
                  >
                    {isApproving ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </TooltipTrigger>
              {isDuplicate && (
                <TooltipContent>
                  <p>Cannot approve duplicate invoice. Please change the invoice number first.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Invoice Approval</DialogTitle>
                <DialogDescription>
                  The following selected fields are present. Approving will update the invoice status.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-60 overflow-y-auto my-4 pr-2">
                <div className="grid gap-2 text-sm">
                  {selectedFields
                    .filter((key) => {
                      const hiddenFields = [
                        'id',
                        'userId',
                        'attachmentId',
                        'fileUrl',
                        'fileKey',
                        's3JsonKey',
                        'createdAt',
                        'updatedAt',
                        'sourcePdfUrl',
                        'vendorData',
                        'isDeleted',
                        'deletedAt',
                        'vendorId',
                        'customerData'
                      ];
                      return !hiddenFields.includes(key);
                    })
                    .map((key) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-4 items-center"
                      >
                        <span className="text-muted-foreground">
                          {formatLabel(key)}
                        </span>
                        <span className="font-semibold text-right truncate">
                          {key === 'status'
                            ? capitalizeStatus(invoiceDetails[key as keyof InvoiceDetails] as string)
                            : (key === 'invoiceDate' || key === 'dueDate')
                              ? formatDate(invoiceDetails[key as keyof InvoiceDetails] as string)
                              // @ts-ignore
                              : renderValue(invoiceDetails[key as keyof InvoiceDetails])
                          }
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleConfirmApproval}
                  disabled={isApproving}
                >
                  {isApproving ? "Confirming..." : "Confirm Approval"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      {isInvoiceFinalized && (
        <div className="flex items-center justify-end">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${invoiceDetails.status === "approved"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
            {invoiceDetails.status === "approved" ? "✓ Approved" : invoiceDetails.status === "rejected" ? "✗ Rejected" : `✓ ${capitalizeStatus(invoiceDetails.status)}`}
          </div>
        </div>
      )}

      {/* QuickBooks Integration Error Dialog */}
      <Dialog open={isQuickBooksErrorOpen} onOpenChange={setIsQuickBooksErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QuickBooks Integration Required</DialogTitle>
            <DialogDescription>
              To approve invoices and create bills in QuickBooks, you need to connect your QuickBooks account first.
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
                      Please connect your QuickBooks account in the integrations page to enable invoice approval and bill creation.
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

      {/* Line Items Validation Error Dialog */}
      <Dialog open={isLineItemsErrorOpen} onOpenChange={setIsLineItemsErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lineItemsViewMode === 'single' ? 'Single Line Item Incomplete' : 'Line Items Incomplete'}
            </DialogTitle>
            <DialogDescription>
              {lineItemsViewMode === 'single'
                ? 'The single line item is missing required categorization. Please complete the Cost Type and Category before approving the invoice.'
                : 'Some line items are missing required categorization. Please complete all line items before approving the invoice.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 max-h-[400px] overflow-y-auto">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    {lineItemsViewMode === 'single'
                      ? 'Missing Cost Type and Category Selection'
                      : 'Missing Item Type and Resource Selection'
                    }
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p className="mb-2">
                      {lineItemsViewMode === 'single'
                        ? 'Please configure the single line item with:'
                        : 'The following line items need both an item type (Indirect or Job Cost) and a selection:'
                      }
                    </p>
                    {lineItemsViewMode === 'single' ? (
                      <ul className="list-disc list-inside space-y-1">
                        <li className="font-medium">Cost Type (Indirect or Job Cost)</li>
                        <li className="font-medium">Category selection based on Cost Type</li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {incompleteLineItems.map((itemName, index) => (
                          <li key={index} className="font-medium">{itemName}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {lineItemsViewMode === 'single' ? 'OK, I\'ll Configure It' : 'OK, I\'ll Complete Them'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}