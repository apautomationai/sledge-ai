"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/axios-client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import AttachmentsList from "./attachments-list";
import AttachmentViewer from "./attachment-viewer";
import InvoiceDetailsForm from "./invoice-details-form";
import InvoicesList from "./invoices-list";
import InvoicePdfViewer from "./invoice-pdf-viewer";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import type { Attachment, InvoiceDetails, InvoiceListItem, InvoiceStatus } from "@/lib/types/invoice";
import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";

// API Response type for single invoice/attachment actions
interface InvoiceApiResponse {
  success: boolean;
  data: InvoiceDetails;
}

interface AttachmentApiResponse {
  success: boolean;
  data: Attachment;
}

export default function InvoiceReviewClient({
  attachments,
  initialInvoiceDetails,
  currentPage,
  totalPages,
  invoices,
  invoiceCurrentPage,
  invoiceTotalPages,
  initialSelectedInvoice,
  initialInvoiceCache,
  activeTab,
}: {
  attachments: Attachment[];
  initialInvoiceDetails: InvoiceDetails | null;
  currentPage: number;
  totalPages: number;
  invoices: InvoiceListItem[];
  invoiceCurrentPage: number;
  invoiceTotalPages: number;
  initialSelectedInvoice: InvoiceListItem | null | undefined;
  initialInvoiceCache: Record<number, InvoiceDetails>;
  activeTab: "attachments" | "invoices";
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const [activeTabState, setActiveTabState] = useState<"attachments" | "invoices">(activeTab || "attachments");

  // Ref to access line item changes from InvoiceDetailsForm
  const lineItemChangesRef = useRef<{
    saveLineItemChanges: () => Promise<void>;
    hasChanges: () => boolean;
  } | null>(null);

  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(
    attachments?.length > 0 ? attachments[0]!.id : null
  );
  const [isUploading, setIsUploading] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(initialSelectedInvoice?.id || null);

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(initialInvoiceDetails);
  const [originalInvoiceDetails, setOriginalInvoiceDetails] = useState<InvoiceDetails | null>(initialInvoiceDetails);

  const [invoiceDetailsCache, setInvoiceDetailsCache] = useState<Record<number, InvoiceDetails>>(initialInvoiceCache);

  const [invoicesList, setInvoicesList] = useState<InvoiceListItem[]>(invoices);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type?: 'invoice' | 'attachment';
    id?: number | string;
    associatedInvoice?: {
      invoiceNumber: string;
      vendorName: string;
    };
  }>({ open: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [justDeletedInvoiceId, setJustDeletedInvoiceId] = useState<number | null>(null);

  // Clone dialog state
  const [cloneDialog, setCloneDialog] = useState<{
    open: boolean;
    invoiceId?: number;
    invoiceNumber?: string;
  }>({ open: false });
  const [isCloning, setIsCloning] = useState(false);

  // Sync invoices list with prop changes (for pagination)
  useEffect(() => {
    // Don't sync if we just deleted an invoice - let local state take precedence
    if (justDeletedInvoiceId !== null) {
      // Check if the deleted invoice is still in the props (it shouldn't be after server refresh)
      const deletedInvoiceStillExists = invoices.some(inv => inv.id === justDeletedInvoiceId);
      if (!deletedInvoiceStillExists) {
        // Server has confirmed deletion, clear the flag and sync with props
        setJustDeletedInvoiceId(null);
        setInvoicesList(invoices);
      }
      // Otherwise, keep using local state until server confirms
      return;
    }

    setInvoicesList(invoices);

    // Update selected invoice when invoices change (for pagination)
    if (invoices?.length > 0) {
      // If current selection is not in the new list, select the first item
      const currentInvoiceExists = invoices.some(inv => inv.id === selectedInvoiceId);
      if (!currentInvoiceExists) {
        const firstInvoice = invoices[0];
        if (firstInvoice) {
          setSelectedInvoiceId(firstInvoice.id);

          // Load details for the first invoice if available in cache
          const cachedDetails = initialInvoiceCache[firstInvoice.id];
          if (cachedDetails) {
            setInvoiceDetails(cachedDetails);
            setOriginalInvoiceDetails(cachedDetails);
          }
        }
      }
    } else {
      setSelectedInvoiceId(null);
      setInvoiceDetails(null);
      setOriginalInvoiceDetails(null);
    }
  }, [invoices, selectedInvoiceId, initialInvoiceCache, justDeletedInvoiceId]);

  // Update selected attachment when attachments change (for pagination)
  useEffect(() => {
    if (attachments?.length > 0) {
      // If current selection is not in the new list, select the first item
      const currentAttachmentExists = attachments.some(att => att.id === selectedAttachmentId);
      if (!currentAttachmentExists && attachments[0]) {
        setSelectedAttachmentId(attachments[0].id);
      }
    } else {
      setSelectedAttachmentId(null);
    }
  }, [attachments, selectedAttachmentId]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (invoiceDetails) {
      setSelectedFields(Object.keys(invoiceDetails));
    }
  }, [invoiceDetails]);

  // Function to update invoice status in the list
  const updateInvoiceStatusInList = (invoiceId: number, newStatus: InvoiceStatus) => {
    setInvoicesList(prevList =>
      prevList.map(invoice =>
        invoice.id === invoiceId
          ? { ...invoice, status: newStatus }
          : invoice
      )
    );
  };

  // Function to add new invoice to the list
  const addInvoiceToList = (newInvoice: InvoiceDetails) => {
    console.log('Invoice Review Client: Adding new invoice to list:', newInvoice);

    const invoiceListItem: InvoiceListItem = {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      vendorName: newInvoice.vendorName,
      totalAmount: newInvoice.totalAmount,
      status: newInvoice.status,
      createdAt: newInvoice.createdAt,
    };

    console.log('Invoice Review Client: Created list item:', invoiceListItem);

    setInvoicesList(prevList => {
      console.log('Invoice Review Client: Previous list length:', prevList.length);
      const newList = [invoiceListItem, ...prevList];
      console.log('Invoice Review Client: New list length:', newList.length);
      return newList;
    });
  };

  // Function to update existing invoice in the list
  const updateInvoiceInList = (updatedInvoice: InvoiceDetails) => {
    const invoiceListItem: InvoiceListItem = {
      id: updatedInvoice.id,
      invoiceNumber: updatedInvoice.invoiceNumber,
      vendorName: updatedInvoice.vendorName,
      totalAmount: updatedInvoice.totalAmount,
      status: updatedInvoice.status,
      createdAt: updatedInvoice.createdAt,
    };

    setInvoicesList(prevList =>
      prevList.map(invoice =>
        invoice.id === updatedInvoice.id ? invoiceListItem : invoice
      )
    );

    // Update invoice details if it's currently selected
    if (selectedInvoiceId === updatedInvoice.id) {
      setInvoiceDetails(updatedInvoice);
      setOriginalInvoiceDetails(updatedInvoice);
      setInvoiceDetailsCache(prevCache => ({
        ...prevCache,
        [updatedInvoice.id]: updatedInvoice
      }));
    }
  };

  // Function to refresh invoice data from API
  const refreshInvoiceData = useCallback(async () => {
    try {
      console.log('Invoice Review Client: Refreshing invoice data from API');
      console.log('Current invoices list length:', invoicesList.length);
      console.log('Current page:', invoiceCurrentPage);

      // Fetch latest invoices from API (always fetch page 1 to get newest invoices)
      const response = await client.get<{
        data?: { invoices: InvoiceListItem[], pagination: { totalPages: number } };
        invoices?: InvoiceListItem[];
        pagination?: { totalPages: number };
      }>(
        `api/v1/invoice/invoices?page=1&limit=20`
      );

      console.log('API Response:', response);

      console.log('Checking response structure:', response.data);
      console.log('response.data?.data exists:', !!response.data?.data);
      console.log('response.data?.invoices exists:', !!response.data?.invoices);

      let newInvoices: InvoiceListItem[] = [];

      if (response.data?.data?.invoices) {
        newInvoices = response.data.data.invoices;
        console.log('Using nested structure: response.data.data.invoices');
      } else if (response.data?.invoices) {
        newInvoices = response.data.invoices;
        console.log('Using direct structure: response.data.invoices');
      } else {
        console.error('Unknown response structure:', response.data);
        return;
      }

      console.log('Invoice Review Client: Fetched', newInvoices.length, 'invoices from API');
      console.log('New invoices:', newInvoices);

      // Update the invoices list with fresh data
      console.log('About to update invoices list from', invoicesList.length, 'to', newInvoices.length);

      // Force a new array reference to ensure React detects the change
      setInvoicesList(prevList => {
        console.log('State update: Previous list length:', prevList.length);
        console.log('State update: New list length:', newInvoices.length);
        return [...newInvoices];
      });
      console.log('Updated invoices list state');

      // Force a re-render by toggling loading state and incrementing refresh count
      setRefreshCount(prev => prev + 1);
      setIsDetailsLoading(true);
      setTimeout(() => setIsDetailsLoading(false), 10);

      // If there are new invoices and no invoice is currently selected, select the first one
      if (newInvoices.length > 0 && !selectedInvoiceId) {
        const firstInvoice = newInvoices[0];
        if (firstInvoice) {
          setSelectedInvoiceId(firstInvoice.id);

          // Fetch details for the first invoice
          try {
            const detailsResponse = await client.get<InvoiceDetails>(`/api/v1/invoice/invoices/${firstInvoice.id}`);
            const newDetails = detailsResponse.data;

            setInvoiceDetails(newDetails);
            setInvoiceDetailsCache(prev => ({
              ...prev,
              [newDetails.id]: newDetails
            }));
          } catch (detailsError) {
            console.error('Error fetching invoice details:', detailsError);
          }
        }
      }
    } catch (error) {
      console.error('Invoice Review Client: Error refreshing data:', error);
      // Fallback to page refresh if API call fails
      router.refresh();
    }
  }, [router, invoiceCurrentPage, selectedInvoiceId]);

  // Function to refresh attachments (requires full page refresh since attachments are props)
  const refreshAttachments = useCallback(() => {
    console.log('Invoice Review Client: Refreshing attachments (full page refresh)');
    router.refresh();
  }, [router]);

  // Expose refresh function to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugRefreshInvoices = refreshInvoiceData;
      (window as any).debugInvoicesList = invoicesList;
      (window as any).debugActiveTab = activeTabState;
      (window as any).debugRefreshCount = refreshCount;
    }
  }, [refreshInvoiceData, invoicesList, activeTabState, refreshCount]);

  // Set up real-time WebSocket connection
  const { joinInvoiceList, leaveInvoiceList } = useRealtimeInvoices({
    onRefreshNeeded: () => {
      // Use appropriate refresh based on active tab
      if (activeTabState === 'invoices') {
        refreshInvoiceData();
      } else {
        refreshAttachments();
      }
    },
    onInvoiceCreated: (invoiceId) => {
      console.log('🔥 NEW INVOICE CREATED HANDLER CALLED:', invoiceId);
      console.log('Current active tab:', activeTabState);
      console.log('Current invoices list length before refresh:', invoicesList.length);

      // Show debugging info
      console.log('🚨 INVOICE CREATED - TRIGGERING REFRESH');

      // New invoice created - refresh invoices list and also attachments (since attachment was processed)
      refreshInvoiceData();

      if (activeTabState === 'attachments') {
        // If we're viewing attachments, also refresh them since one was processed
        setTimeout(() => refreshAttachments(), 500);
      }
    },
    onInvoiceUpdated: (invoiceId) => {
      console.log('Invoice updated, refreshing list:', invoiceId);
      refreshInvoiceData();
    },
    onInvoiceStatusUpdated: (invoiceId, status) => {
      console.log('Invoice status updated:', invoiceId, status);
      // Update the specific invoice status in the list without full refresh
      updateInvoiceStatusInList(invoiceId, status as InvoiceStatus);
    },
    onInvoiceDeleted: (invoiceId) => {
      console.log('Invoice deleted, refreshing list:', invoiceId);
      refreshInvoiceData();
    },
    enableToasts: false,
    autoConnect: true,
  });

  // Join invoice list room when component mounts, leave when unmounts
  useEffect(() => {
    console.log('🔌 WebSocket room management - Active tab:', activeTabState);

    if (activeTabState === 'invoices') {
      console.log('📋 Joining invoice list room');
      joinInvoiceList();
    } else {
      console.log('📋 Leaving invoice list room (not on invoices tab)');
      leaveInvoiceList();
    }

    return () => {
      console.log('🔌 Cleanup: Leaving invoice list room');
      leaveInvoiceList();
    };
  }, [activeTabState, joinInvoiceList, leaveInvoiceList]);

  const selectedAttachment = useMemo(
    () => attachments.find((att) => att.id === selectedAttachmentId) || null,
    [attachments, selectedAttachmentId]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectAttachment = (attachment: Attachment) => {
    setSelectedAttachmentId(attachment.id);
  };

  const handleSelectInvoice = async (invoice: InvoiceListItem) => {
    if (invoice.id === selectedInvoiceId) return;

    setIsEditing(false);
    setHasUnsavedChanges(false);
    setSelectedInvoiceId(invoice.id);

    // Check if we have the details in cache
    const cachedDetails = invoiceDetailsCache[invoice.id];
    if (cachedDetails) {
      setInvoiceDetails(cachedDetails);
      setOriginalInvoiceDetails(cachedDetails);
      return;
    }

    setIsDetailsLoading(true);
    try {
      const response = await client.get<InvoiceDetails>(`/api/v1/invoice/invoices/${invoice.id}`);
      const newDetails = response.data;

      if (newDetails) {
        setInvoiceDetails(newDetails);
        setOriginalInvoiceDetails(newDetails);
        setInvoiceDetailsCache(prevCache => ({
          ...prevCache,
          [invoice.id]: newDetails
        }));
      }
    } catch (error: any) {
      let errorMessage = "Could not load invoice details.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleTabChange = (newTab: "attachments" | "invoices") => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('tab', newTab);
    // Preserve current page numbers
    router.push(`/invoice-review?${searchParams.toString()}`);
    setActiveTabState(newTab);
  };

  const handleAttachmentPageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', page.toString());
    // Preserve the current tab
    if (activeTabState) {
      searchParams.set('tab', activeTabState);
    }
    router.push(`/invoice-review?${searchParams.toString()}`);
  };

  const handleInvoicePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('invoicePage', page.toString());
    // Preserve the current tab
    if (activeTabState) {
      searchParams.set('tab', activeTabState);
    }
    router.push(`/invoice-review?${searchParams.toString()}`);
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!invoiceDetails) return;
    const { name, value } = e.target;
    setInvoiceDetails((prev) => (prev ? { ...prev, [name]: value } : null));
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    setInvoiceDetails(originalInvoiceDetails);
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!invoiceDetails) return;
    try {
      // If invoice was approved or rejected, reset status to pending when editing
      const dataToSave = {
        ...invoiceDetails,
        ...(invoiceDetails.status === 'approved' || invoiceDetails.status === 'rejected'
          ? { status: 'pending' }
          : {}
        )
      };

      const response = await client.patch(
        `/api/v1/invoice/${invoiceDetails.id}`,
        dataToSave
      );

      // Access the data property from the response
      const updatedData = response?.data;

      // Save line item changes if any
      if (lineItemChangesRef.current && lineItemChangesRef.current.hasChanges()) {
        await lineItemChangesRef.current.saveLineItemChanges();
        toast.success("Invoice and line items saved successfully");
      } else {
        toast.success("Invoice saved successfully");
      }

      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);
      setInvoiceDetailsCache(prevCache => ({
        ...prevCache,
        [updatedData?.id]: updatedData
      }));

      // Update the invoice status in the list for real-time UI update
      if (updatedData?.status) {
        updateInvoiceStatusInList(updatedData.id, updatedData.status);
      }

      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handleApproveInvoice = async () => {
    if (!invoiceDetails) return;
    try {
      const response = await client.patch<{ data: InvoiceDetails }>(
        `/api/v1/invoice/invoices/${invoiceDetails.id}`,
        { status: "approved" }
      );

      // Access the data property from the response
      const updatedData = response.data.data;

      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);
      setInvoiceDetailsCache(prevCache => ({
        ...prevCache,
        [updatedData.id]: updatedData
      }));

      // Update the invoice status in the list for real-time UI update
      updateInvoiceStatusInList(updatedData.id, "approved");

      toast.success("Invoice has been approved");
    } catch (err) {

      toast.error("Failed to approve invoice");
    }
  };

  const handleRejectInvoice = async () => {
    if (!invoiceDetails) return;
    try {
      const response = await client.patch<{ data: InvoiceDetails }>(
        `/api/v1/invoice/invoices/${invoiceDetails.id}`,
        { status: "rejected" }
      );

      // Access the data property from the response
      const updatedData = response.data.data;

      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);
      setInvoiceDetailsCache(prevCache => ({
        ...prevCache,
        [updatedData.id]: updatedData
      }));

      // Update the invoice status in the list for real-time UI update
      updateInvoiceStatusInList(updatedData.id, "rejected");

      toast.success("Invoice has been rejected");
    } catch (err) {
      toast.error("Failed to reject invoice");
    }
  };


  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Invalid file type. Only PDF files are accepted.");
      return;
    }

    setSelectedAttachmentId(null);
    setIsUploading(true);
    const uploadToast = toast.loading("Preparing to upload...");

    try {
      const response = await client.get<{
        signedUrl: string;
        publicUrl: string;
        key: string;
      }>(
        `/api/v1/upload/upload-attachment`,
        { params: { filename: file.name, mimetype: file.type } }
      );
      //@ts-ignore
      const { signedUrl, publicUrl, key } = response;

      if (!signedUrl || !publicUrl || !key) {
        throw new Error("Failed to retrieve valid upload details from the server.");
      }

      const uploadResponse = await axios.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
        timeout: 60000,
      });

      if (uploadResponse.status !== 200) {
        throw new Error("File upload to storage failed.");
      }

      const createRecordResponse = await client.post<AttachmentApiResponse>("/api/v1/upload/create-record", {
        filename: file.name,
        mimetype: file.type,
        fileUrl: publicUrl,
        fileKey: key,
      });

      const newAttachment = createRecordResponse.data;

      toast.success("PDF uploaded and processed successfully!", { id: uploadToast });
      //@ts-ignore
      setSelectedAttachmentId(newAttachment.id);

      router.refresh();

    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during upload.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle invoice deletion
  const handleDeleteInvoice = (invoiceId: number) => {
    setDeleteDialog({
      open: true,
      type: 'invoice',
      id: invoiceId,
    });
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteDialog.id || deleteDialog.type !== 'invoice') return;

    setIsDeleting(true);
    try {
      await client.delete(`/api/v1/invoice/invoices/${deleteDialog.id}`);

      toast.success('Invoice deleted successfully');

      // Mark this invoice as just deleted to prevent useEffect from overwriting local state
      setJustDeletedInvoiceId(deleteDialog.id as number);

      // Remove from local state
      const remainingInvoices = invoicesList.filter(i => i.id !== deleteDialog.id);
      setInvoicesList(remainingInvoices);

      // Force re-render by incrementing refresh count
      setRefreshCount(prev => prev + 1);

      // Remove from cache
      setInvoiceDetailsCache(prev => {
        const newCache = { ...prev };
        delete newCache[deleteDialog.id as number];
        return newCache;
      });

      // Auto-select next invoice if deleted invoice was selected
      if (selectedInvoiceId === deleteDialog.id) {
        if (remainingInvoices.length > 0) {
          const nextInvoice = remainingInvoices[0];
          if (nextInvoice) {
            setSelectedInvoiceId(nextInvoice.id);
            // Load details for the next invoice if available in cache
            const cachedDetails = invoiceDetailsCache[nextInvoice.id];
            if (cachedDetails) {
              setInvoiceDetails(cachedDetails);
              setOriginalInvoiceDetails(cachedDetails);
            } else {
              // Fetch details for the next invoice
              try {
                const response = await client.get<InvoiceDetails>(`/api/v1/invoice/invoices/${nextInvoice.id}`);
                const newDetails = response.data;
                setInvoiceDetails(newDetails);
                setOriginalInvoiceDetails(newDetails);
                setInvoiceDetailsCache(prev => ({
                  ...prev,
                  [newDetails.id]: newDetails
                }));
              } catch (error) {
                console.error('Error fetching next invoice details:', error);
              }
            }
          }
        } else {
          // No invoices remaining - show empty state
          setSelectedInvoiceId(null);
          setInvoiceDetails(null);
          setOriginalInvoiceDetails(null);
        }
      }

      // Close dialog
      setDeleteDialog({ open: false });

      // If we're on a page beyond what's available after deletion, refresh to correct pagination
      if (remainingInvoices.length === 0 && invoiceCurrentPage > 1) {
        // Navigate to previous page if current page is now empty
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('invoicePage', String(invoiceCurrentPage - 1));
        if (activeTabState) {
          searchParams.set('tab', activeTabState);
        }
        router.push(`/invoice-review?${searchParams.toString()}`);
      }
    } catch (error: any) {
      let errorMessage = 'Failed to delete invoice';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle invoice cloning - show confirmation dialog
  const handleCloneInvoice = (invoiceId: number) => {
    // Find the invoice to get its number
    const invoice = invoicesList.find(inv => inv.id === invoiceId);
    setCloneDialog({
      open: true,
      invoiceId,
      invoiceNumber: invoice?.invoiceNumber || `Invoice #${invoiceId}`,
    });
  };

  // Confirm and execute clone
  const confirmCloneInvoice = async () => {
    if (!cloneDialog.invoiceId) return;

    setIsCloning(true);
    try {
      const response: any = await client.post(`/api/v1/invoice/invoices/${cloneDialog.invoiceId}/clone`);

      if (response.success) {
        toast.success("Invoice cloned successfully");
        setCloneDialog({ open: false });

        // Refresh the page to show the new invoice
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error cloning invoice:", error);
      toast.error("Failed to clone invoice");
    } finally {
      setIsCloning(false);
    }
  };

  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      // Check for associated invoice
      const response = await client.get(`/api/v1/email/attachments/${attachmentId}/invoice`) as any;
      const associatedInvoice = response?.data?.data || response?.data || response;

      setDeleteDialog({
        open: true,
        type: 'attachment',
        id: attachmentId,
        associatedInvoice: associatedInvoice ? {
          invoiceNumber: associatedInvoice.invoiceNumber,
          vendorName: associatedInvoice.vendorName,
        } : undefined,
      });
    } catch (error) {
      // If no associated invoice found, proceed with deletion dialog
      setDeleteDialog({
        open: true,
        type: 'attachment',
        id: attachmentId,
      });
    }
  };

  const confirmDeleteAttachment = async () => {
    if (!deleteDialog.id || deleteDialog.type !== 'attachment') return;

    setIsDeleting(true);
    try {
      const response = await client.delete(`/api/v1/email/attachments/${deleteDialog.id}`) as any;

      toast.success('Attachment deleted successfully');

      // If associated invoice was also deleted, remove it from invoices list
      if (response?.deletedInvoice) {
        const remainingInvoices = invoicesList.filter(i => i.id !== response.deletedInvoice.id);
        setInvoicesList(remainingInvoices);

        // Force re-render by incrementing refresh count
        setRefreshCount(prev => prev + 1);

        // Remove from cache
        setInvoiceDetailsCache(prev => {
          const newCache = { ...prev };
          delete newCache[response.deletedInvoice.id];
          return newCache;
        });

        // Clear invoice details if it was selected
        if (selectedInvoiceId === response.deletedInvoice.id) {
          // Try to select next available invoice
          if (remainingInvoices.length > 0) {
            const nextInvoice = remainingInvoices[0];
            if (nextInvoice) {
              setSelectedInvoiceId(nextInvoice.id);
              const cachedDetails = invoiceDetailsCache[nextInvoice.id];
              if (cachedDetails) {
                setInvoiceDetails(cachedDetails);
                setOriginalInvoiceDetails(cachedDetails);
              }
            }
          } else {
            setSelectedInvoiceId(null);
            setInvoiceDetails(null);
            setOriginalInvoiceDetails(null);
          }
        }
      }

      // Close dialog before refresh
      setDeleteDialog({ open: false });

      // Refresh attachments list (requires page refresh since attachments are props)
      // Check if we need to navigate to previous page
      const remainingAttachments = attachments.filter(a => a.id !== deleteDialog.id);
      if (remainingAttachments.length === 0 && currentPage > 1) {
        // Navigate to previous page if current page is now empty
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('page', String(currentPage - 1));
        if (activeTabState) {
          searchParams.set('tab', activeTabState);
        }
        router.push(`/invoice-review?${searchParams.toString()}`);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      let errorMessage = 'Failed to delete attachment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isClient) return null;

  const ModernTabs = () => {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const activeTabIndex = activeTabState === 'attachments' ? 0 : 1;
      const activeTabNode = tabsRef.current[activeTabIndex];
      const sliderNode = sliderRef.current;

      if (activeTabNode && sliderNode) {
        sliderNode.style.left = `${activeTabNode.offsetLeft}px`;
        sliderNode.style.width = `${activeTabNode.offsetWidth}px`;
      }
    }, [activeTabState]);

    return (
      <div className="relative flex items-center bg-muted p-1 rounded-lg self-start md:-mt-5">
        <div
          ref={sliderRef}
          className="absolute top-1 bottom-1 bg-background shadow-sm rounded-md transition-all duration-300 ease-in-out"
        />
        {['attachments', 'invoices'].map((tab, index) => (
          <button
            key={tab}
            ref={(el) => { tabsRef.current[index] = el; }}
            onClick={() => handleTabChange(tab as "invoices" | "attachments")}
            className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 rounded-md focus:outline-none ${activeTabState === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
      <div className="flex items-center border-b border-border px-4 py-2 md:pb-2">
        <ModernTabs />
      </div>

      <div className="flex-grow p-4 min-h-0">
        <div key={activeTabState} className="animate-fade-in h-full">
          {activeTabState === 'attachments' && (
            <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <AttachmentsList
                  attachments={attachments}
                  selectedAttachment={selectedAttachment}
                  onSelectAttachment={handleSelectAttachment}
                  onFileUpload={handleFileUpload}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handleAttachmentPageChange}
                  isUploading={isUploading}
                  onDeleteAttachment={handleDeleteAttachment}
                />
              </div>
              <div className="md:col-span-8">
                {selectedAttachment ? (
                  <AttachmentViewer
                    attachment={selectedAttachment}
                    fileUrl={selectedAttachment.fileUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                    <p>Select or upload a PDF attachment to begin.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTabState === 'invoices' && (
            <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <InvoicesList
                  key={`invoices-${invoicesList.length}-${refreshCount}`}
                  invoices={invoicesList}
                  selectedInvoiceId={selectedInvoiceId}
                  onSelectInvoice={handleSelectInvoice}
                  currentPage={invoiceCurrentPage}
                  totalPages={invoiceTotalPages}
                  onPageChange={handleInvoicePageChange}
                  onDeleteInvoice={handleDeleteInvoice}
                  onCloneInvoice={handleCloneInvoice}
                />
              </div>

              {invoiceDetails ? (
                <>
                  <div className={`md:col-span-5 transition-opacity duration-300 ${isDetailsLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <InvoicePdfViewer
                      fileUrl={invoiceDetails.fileUrl}
                      sourcePdfUrl={invoiceDetails.sourcePdfUrl}
                    />
                  </div>

                  <div className={`md:col-span-4 relative transition-opacity duration-300 ${isDetailsLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {isDetailsLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    <InvoiceDetailsForm
                      invoiceDetails={invoiceDetails}
                      originalInvoiceDetails={originalInvoiceDetails || invoiceDetails}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      onDetailsChange={handleDetailsChange}
                      selectedFields={selectedFields}
                      setSelectedFields={setSelectedFields}
                      onSave={handleSaveChanges}
                      onReject={handleRejectInvoice}
                      onApprove={handleApproveInvoice}
                      onCancel={handleCancelEdit}
                      onFieldChange={() => setHasUnsavedChanges(true)}
                      lineItemChangesRef={lineItemChangesRef}
                      setInvoicesList={setInvoicesList}
                      setSelectedInvoiceId={setSelectedInvoiceId}
                      setInvoiceDetails={setInvoiceDetails}
                      setOriginalInvoiceDetails={setOriginalInvoiceDetails}
                      setInvoiceDetailsCache={setInvoiceDetailsCache}
                      onApprovalSuccess={() => {
                        // Update the invoice status in the list for real-time UI update
                        if (invoiceDetails) {
                          updateInvoiceStatusInList(invoiceDetails.id, "approved");
                        }
                        setSelectedInvoiceId(null);
                        router.refresh();
                      }}
                      onInvoiceDetailsUpdate={(updatedDetails) => {
                        setInvoiceDetails(updatedDetails);
                        setOriginalInvoiceDetails(updatedDetails);
                        setInvoiceDetailsCache(prevCache => ({
                          ...prevCache,
                          [updatedDetails.id]: updatedDetails
                        }));
                        // Update the invoice status in the list for real-time UI update
                        if (updatedDetails.status) {
                          updateInvoiceStatusInList(updatedDetails.id, updatedDetails.status);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-9 flex items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                  <div className="p-8">
                    <p className="text-lg font-medium mb-2">
                      {invoicesList.length === 0 ? 'No invoices available' : 'Select an invoice to view its details'}
                    </p>
                    {invoicesList.length === 0 && (
                      <p className="text-sm">Upload an attachment to create your first invoice.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        onConfirm={deleteDialog.type === 'invoice' ? confirmDeleteInvoice : confirmDeleteAttachment}
        title={deleteDialog.type === 'invoice' ? 'Delete Invoice' : 'Delete Attachment'}
        description={
          deleteDialog.type === 'invoice'
            ? 'Are you sure you want to delete this invoice? This action cannot be undone.'
            : 'Are you sure you want to delete this attachment? This action cannot be undone.'
        }
        associatedInvoice={deleteDialog.associatedInvoice}
        isDeleting={isDeleting}
      />

      {/* Clone Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={cloneDialog.open}
        onOpenChange={(open) => setCloneDialog({ open })}
        onConfirm={confirmCloneInvoice}
        title="Clone Invoice"
        description={`Are you sure you want to clone invoice "${cloneDialog.invoiceNumber}"? This will create a duplicate with all line items.`}
        isDeleting={isCloning}
        confirmText="Clone"
        confirmVariant="default"
      />

      <style jsx global>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

