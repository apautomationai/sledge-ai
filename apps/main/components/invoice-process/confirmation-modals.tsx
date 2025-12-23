"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/dialog";
import { InvoiceDetails } from "@/lib/types/invoice";
import { formatLabel, renderValue, formatDate } from "@/lib/utility/formatters";

// Helper function to capitalize status
const capitalizeStatus = (status: string | null | undefined): string => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface ConfirmationModalsProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  invoiceDetails: InvoiceDetails;
  originalInvoiceDetails: InvoiceDetails;
  selectedFields: string[];
  onSave: () => Promise<void>;
  onReject: () => Promise<void>;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  onApprovalSuccess?: () => void;
  onInvoiceDetailsUpdate?: (updatedDetails: InvoiceDetails) => void;
  onFieldChange?: () => void;
}

export default function ConfirmationModals({
  invoiceDetails,
  selectedFields,
  onSave,
  onApprovalSuccess,
  onInvoiceDetailsUpdate,
}: ConfirmationModalsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isQuickBooksErrorOpen, setIsQuickBooksErrorOpen] = useState(false);
  const [isLineItemsErrorOpen, setIsLineItemsErrorOpen] = useState(false);
  const [incompleteLineItems, setIncompleteLineItems] = useState<string[]>([]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
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

      // Fetch line items from database
      const response: any = await client.get(`/api/v1/invoice/line-items/invoice/${invoiceId}`);

      if (!response.success || !response.data) {
        return { isValid: true, incompleteItems: [] };
      }

      const lineItems = response.data;
      const incompleteItems: string[] = [];

      // Check each line item for missing itemType or resourceId
      lineItems.forEach((item: any) => {
        const hasItemType = item.itemType && (item.itemType === 'account' || item.itemType === 'product');
        const hasResourceId = item.resourceId && item.resourceId.trim() !== '';

        if (!hasItemType || !hasResourceId) {
          incompleteItems.push(item.item_name || `Line Item ${item.id}`);
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
    await onSave();
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
      // Step 1: Get line items from database using invoice ID
      const invoiceId = invoiceDetails.id;
      if (!invoiceId) {
        throw new Error("Invoice ID not found");
      }

      const dbLineItemsResponse: any = await client.get(`/api/v1/invoice/line-items/invoice/${invoiceId}`);

      if (dbLineItemsResponse.success && dbLineItemsResponse.data.length > 0) {
        const lineItems = dbLineItemsResponse.data;
        const totalAmountFromPopup = parseFloat(invoiceDetails?.totalAmount ?? "0") || 0;
        const lineItemsSum = lineItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
        const discountAmount = lineItemsSum - totalAmountFromPopup;
        const vendorId = invoiceDetails?.vendorData?.quickbooksId;

        const totalTaxAmount = parseFloat(invoiceDetails?.totalTax ?? "0") || 0;

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
            })
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
    setIsRejecting(true);

    try {
      const invoiceId = invoiceDetails.id;

      // Update invoice status to rejected
      const statusUpdateResponse: any = await client.patch(`/api/v1/invoice/${invoiceId}/status`, {
        status: "rejected"
      });

      // Update local invoice details state
      if (onInvoiceDetailsUpdate && statusUpdateResponse.success) {
        const updatedDetails = { ...invoiceDetails, status: "rejected" };
        onInvoiceDetailsUpdate(updatedDetails as InvoiceDetails);
      }

      toast.dismiss();
      toast.success("Invoice has been rejected");

      // Close the dialog first
      setIsRejectDialogOpen(false);

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

  const handleRejectClick = async () => {
    // Auto-save before rejection to ensure latest changes are persisted
    setIsSaving(true);
    await onSave();
    setIsSaving(false);

    // Open the reject dialog
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="flex justify-between mt-4">
      <div className="flex gap-2">
        <Button onClick={handleSaveChanges} disabled={isSaving} variant="outline">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Invoice Rejection</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this invoice? This action will mark the invoice as rejected.
                </DialogDescription>
              </DialogHeader>
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
          <Button
            onClick={handleApproveClick}
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={isApproving || isSaving}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
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
                        'vendorId'
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
            <DialogTitle>Line Items Incomplete</DialogTitle>
            <DialogDescription>
              Some line items are missing required categorization. Please complete all line items before approving the invoice.
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
                    Missing Item Type and Resource Selection
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p className="mb-2">
                      The following line items need both an item type (Account or Product/Service) and a selection:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {incompleteLineItems.map((itemName, index) => (
                        <li key={index} className="font-medium">{itemName}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">OK, I'll Complete Them</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}