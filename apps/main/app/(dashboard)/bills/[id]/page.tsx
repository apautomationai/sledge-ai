"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useJobs } from "@/hooks/use-jobs";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Trash2,
  Copy,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { client } from "@/lib/axios-client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import InvoiceDetailsForm from "@/components/invoice-process/invoice-details-form";

// Dynamically import PDF viewer to avoid SSR issues with pdfjs-dist
const InvoicePdfViewer = dynamic(
  () => import("@/components/invoice-process/invoice-pdf-viewer"),
  { ssr: false },
);
import { QuickBooksDataProvider } from "@/components/invoice-process/quickbooks-data-provider";
import { ResizablePanels } from "@/components/ui/resizable-panels";
import type {
  InvoiceDetails,
  InvoiceListItem,
  Attachment,
} from "@/lib/types/invoice";
import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.id as string;

  // Use the useJobs hook to get refetch function
  const { refetch } = useJobs({
    page: 1,
  });

  // Get invoice ID from URL query params
  const invoiceIdFromUrl = searchParams.get("invoiceId");

  const [activeTab, setActiveTab] = useState<"invoice" | "attachment">(
    "invoice",
  );
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [invoicesList, setInvoicesList] = useState<InvoiceListItem[]>([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(
    null,
  );
  const [originalInvoiceDetails, setOriginalInvoiceDetails] =
    useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const lineItemChangesRef = useRef<{
    saveLineItemChanges: () => Promise<void>;
    hasChanges: () => boolean;
  } | null>(null);

  const currentInvoiceId = invoicesList[currentInvoiceIndex]?.id;

  // Set up real-time WebSocket connection for invoice updates
  const { joinInvoiceList, leaveInvoiceList } = useRealtimeInvoices({
    onInvoiceCreated: (invoiceId: number) => {
      // Refresh the invoices list to include the new invoice
      if (jobId) {
        client
          .get(`/api/v1/invoice/invoices-list?attachmentId=${jobId}`)
          .then((response) => {
            const invoiceData =
              response.data?.data?.invoices || response.data?.invoices || [];
            setInvoicesList(invoiceData);
          })
          .catch(console.error);
      }
    },
    onInvoiceUpdated: (invoiceId: number) => {
      // If the updated invoice is the one we're currently viewing, refresh its details
      if (invoiceId === currentInvoiceId) {
        fetchInvoiceDetails(invoiceId);
      }
    },
    onInvoiceStatusUpdated: (invoiceId: number, status: string) => {
      // Update the status in the list
      setInvoicesList((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: status as InvoiceListItem["status"] }
            : inv,
        ),
      );
      // If it's the current invoice, refresh the details
      if (invoiceId === currentInvoiceId) {
        fetchInvoiceDetails(invoiceId);
      }
    },
    onInvoiceDeleted: (invoiceId: number) => {
      // Remove from local list
      const updatedList = invoicesList.filter((inv) => inv.id !== invoiceId);
      setInvoicesList(updatedList);

      if (updatedList.length === 0) {
        toast.info("All bills deleted, returning to bills list");
        router.push("/bills");
      } else if (invoiceId === currentInvoiceId) {
        // If we deleted the current invoice, move to the next or previous
        const newIndex =
          currentInvoiceIndex >= updatedList.length
            ? updatedList.length - 1
            : currentInvoiceIndex;
        setCurrentInvoiceIndex(newIndex);
        const nextInvoice = updatedList[newIndex];
        if (nextInvoice) {
          fetchInvoiceDetails(nextInvoice.id);
        }
      }
    },
    enableToasts: true,
    autoConnect: true,
  });

  // Join invoice list room when component mounts
  useEffect(() => {
    joinInvoiceList();
    return () => {
      leaveInvoiceList();
    };
  }, [joinInvoiceList, leaveInvoiceList]);

  // Handle panel resize with localStorage persistence
  const handlePanelResize = (leftWidth: number) => {
    try {
      localStorage.setItem("invoice-panel-width", leftWidth.toString());
    } catch (error) {
      // Ignore localStorage errors
    }
  };

  // Get initial panel width from localStorage
  const getInitialPanelWidth = () => {
    try {
      const saved = localStorage.getItem("invoice-panel-width");
      return saved ? parseFloat(saved) : 60;
    } catch (error) {
      return 60;
    }
  };

  // Fetch attachment and invoice list for this job
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch attachment data
        try {
          const jobResponse = await client.get(`/api/v1/jobs/${jobId}`);
          const jobData = jobResponse.data?.data || jobResponse.data;
          setAttachment(jobData);
        } catch (error: any) {
          console.error("Failed to fetch job:", error);
          toast.error("Failed to load job details");
        }

        // Fetch lightweight invoices list (only IDs and statuses)
        const response = await client.get(
          `/api/v1/invoice/invoices-list?attachmentId=${jobId}`,
        );
        const invoiceData =
          response.data?.data?.invoices || response.data?.invoices || [];
        setInvoicesList(invoiceData);

        // Load details for specific invoice from URL or first invoice
        if (invoiceData.length > 0) {
          if (invoiceIdFromUrl) {
            const targetInvoiceId = parseInt(invoiceIdFromUrl);
            const invoiceIndex = invoiceData.findIndex(
              (inv: InvoiceListItem) => inv.id === targetInvoiceId,
            );

            if (invoiceIndex !== -1) {
              setCurrentInvoiceIndex(invoiceIndex);
              await fetchInvoiceDetails(targetInvoiceId);
            } else {
              // Invoice not found, load first one
              await fetchInvoiceDetails(invoiceData[0].id);
            }
          } else {
            await fetchInvoiceDetails(invoiceData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId, invoiceIdFromUrl]);

  // Fetch full invoice details
  const fetchInvoiceDetails = async (invoiceId: number) => {
    try {
      setIsDetailsLoading(true);
      const response = await client.get<InvoiceDetails>(
        `/api/v1/invoice/invoices/${invoiceId}`,
      );
      const details = response.data;
      setInvoiceDetails(details);
      setOriginalInvoiceDetails(details);
      setSelectedFields(Object.keys(details));
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      toast.error("Failed to load bill details");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Update details when invoice changes (with debounce to prevent rapid API calls)
  useEffect(() => {
    if (!currentInvoiceId) return;

    const timeoutId = setTimeout(() => {
      fetchInvoiceDetails(currentInvoiceId);
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentInvoiceId]);

  const handleBack = () => {
    refetch();
    router.push("/bills");
  };

  const handlePreviousInvoice = () => {
    if (currentInvoiceIndex > 0) {
      setCurrentInvoiceIndex(currentInvoiceIndex - 1);
    }
  };

  const handleNextInvoice = () => {
    if (currentInvoiceIndex < invoicesList.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!invoiceDetails) return;
    const { name, value } = e.target;
    setInvoiceDetails((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveChanges = async (vendorData?: any, customerData?: any) => {
    if (!invoiceDetails) return;
    try {
      const dataToSave = {
        ...invoiceDetails,
        ...(invoiceDetails.status === "approved" ||
          invoiceDetails.status === "rejected"
          ? { status: "pending" }
          : {}),
        // Include vendor data if provided
        ...(vendorData && { vendorData }),
        // Include customer data if provided
        ...(customerData && { customerData }),
      };

      const response = await client.patch(
        `/api/v1/invoice/${invoiceDetails.id}`,
        dataToSave,
      );
      const updatedData = response?.data;

      // Save line item changes if any
      if (
        lineItemChangesRef.current &&
        lineItemChangesRef.current.hasChanges()
      ) {
        await lineItemChangesRef.current.saveLineItemChanges();
        toast.success("Bill and line items saved successfully");
      } 

      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);

      // Update the invoice in the list
      setInvoicesList((prev) =>
        prev.map((inv) =>
          inv.id === invoiceDetails.id
            ? { ...inv, status: updatedData.status }
            : inv,
        ),
      );

      setIsEditing(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Failed to save changes";
      toast.error(errorMessage);
    }
  };

  const handleApprove = async () => {
    if (!invoiceDetails) return;
    try {
      const response = await client.patch<{ data: InvoiceDetails }>(
        `/api/v1/invoice/invoices/${invoiceDetails.id}`,
        { status: "approved" },
      );
      const updatedData = response.data.data;
      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);

      // Update the invoice in the list
      setInvoicesList((prev) =>
        prev.map((inv) =>
          inv.id === invoiceDetails.id ? { ...inv, status: "approved" } : inv,
        ),
      );

      toast.success("Bill has been approved");
    } catch (err) {
      toast.error("Failed to approve bill");
    }
  };

  const handleReject = async () => {
    if (!invoiceDetails) return;
    try {
      const response = await client.patch<{ data: InvoiceDetails }>(
        `/api/v1/invoice/invoices/${invoiceDetails.id}`,
        { status: "rejected" },
      );
      const updatedData = response.data.data;
      setInvoiceDetails(updatedData);
      setOriginalInvoiceDetails(updatedData);

      // Update the invoice in the list
      setInvoicesList((prev) =>
        prev.map((inv) =>
          inv.id === invoiceDetails.id ? { ...inv, status: "rejected" } : inv,
        ),
      );

      toast.success("Bill has been rejected");
    } catch (err) {
      toast.error("Failed to reject bill");
    }
  };

  const handleCancelEdit = () => {
    setInvoiceDetails(originalInvoiceDetails);
    setIsEditing(false);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceDetails) return;

    setIsDeleting(true);
    try {
      await client.delete(`/api/v1/invoice/invoices/${invoiceDetails.id}`);
      toast.success("Bill page deleted successfully");

      // Remove from local list
      const updatedList = invoicesList.filter(
        (_, index) => index !== currentInvoiceIndex,
      );
      setInvoicesList(updatedList);

      if (updatedList.length === 0) {
        // No more invoices, go back to bills list
        router.push("/bills");
      } else {
        // Move to next invoice or previous if we deleted the last one
        const newIndex =
          currentInvoiceIndex >= updatedList.length
            ? updatedList.length - 1
            : currentInvoiceIndex;
        setCurrentInvoiceIndex(newIndex);
        const nextInvoice = updatedList[newIndex];
        if (nextInvoice) {
          await fetchInvoiceDetails(nextInvoice.id);
        }
      }

      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete bill page");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloneInvoice = async () => {
    if (!invoiceDetails) return;

    setIsCloning(true);
    try {
      const response: any = await client.post(
        `/api/v1/invoice/invoices/${invoiceDetails.id}/clone`,
      );

      if (response.success) {
        toast.success("Bill page cloned successfully");

        // Refresh the invoices list
        const refreshResponse = await client.get(
          `/api/v1/invoice/invoices?attachmentId=${jobId}`,
        );
        const invoiceData =
          refreshResponse.data?.data?.invoices ||
          refreshResponse.data?.invoices ||
          [];
        setInvoicesList(invoiceData);

        // Find and select the new cloned invoice
        const clonedInvoice = invoiceData.find(
          (inv: InvoiceListItem) =>
            inv.invoiceNumber === response.data?.invoiceNumber ||
            inv.id === response.data?.id,
        );

        if (clonedInvoice) {
          const clonedIndex = invoiceData.findIndex(
            (inv: InvoiceListItem) => inv.id === clonedInvoice.id,
          );
          setCurrentInvoiceIndex(clonedIndex);
          await fetchInvoiceDetails(clonedInvoice.id);
        }
      }

      setShowCloneDialog(false);
    } catch (error) {
      console.error("Failed to clone invoice:", error);
      toast.error("Failed to clone bill page");
    } finally {
      setIsCloning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (invoicesList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Job Details
            </h1>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No bills found for this job</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg px-4 py-3 border">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "invoice" | "attachment")
            }
          >
            <TabsList>
              <TabsTrigger value="invoice">Bill</TabsTrigger>
              <TabsTrigger value="attachment">Attachment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 font-medium text-sm px-3 py-1"
          >
            Approved:{" "}
            {invoicesList.filter((inv) => inv.status === "approved").length}
          </Badge>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 font-medium text-sm px-3 py-1"
          >
            Rejected:{" "}
            {invoicesList.filter((inv) => inv.status === "rejected").length}
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium text-sm px-3 py-1"
          >
            Pending:{" "}
            {invoicesList.filter((inv) => inv.status === "pending").length}
          </Badge>
        </div>
      </div>

      {/* Main Content - Resizable Two Column Layout */}
      <ResizablePanels
        defaultLeftWidth={getInitialPanelWidth()}
        minLeftWidth={30}
        maxLeftWidth={80}
        className="h-[calc(100%-4rem)]"
        onResize={handlePanelResize}
        minRightWidthPx={600}
      >
        {/* Left Side - Preview with Carousel */}
        <div className="flex flex-col h-full gap-4 min-w-0 overflow-hidden pr-2">
          {/* Carousel Controls - Only show for invoice tab */}
          {activeTab === "invoice" && (
            <div className="flex items-center justify-between gap-4 bg-card rounded-lg border px-4 py-3 overflow-x-hidden">
              {/* Left: Navigation */}
              {invoicesList.length > 1 ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousInvoice}
                    disabled={currentInvoiceIndex === 0}
                    className="h-9 w-9 bg-primary/10 hover:bg-primary/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Bill {currentInvoiceIndex + 1} of {invoicesList.length}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <Select
                      value={String(currentInvoiceIndex)}
                      onValueChange={(value) => {
                        const newIndex = parseInt(value);
                        setCurrentInvoiceIndex(newIndex);
                      }}
                    >
                      <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder="Select bill" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoicesList.map((invoice, index) => (
                          <SelectItem key={invoice.id} value={String(index)}>
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="font-medium">{index + 1}</span>
                              {invoice.status && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${invoice.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : invoice.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                  {invoice.status.charAt(0).toUpperCase() +
                                    invoice.status.slice(1)}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextInvoice}
                    disabled={currentInvoiceIndex === invoicesList.length - 1}
                    className="h-9 w-9 bg-primary/10 hover:bg-primary/20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Bill 1 of 1</span>
                  {invoicesList.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {invoicesList[0]?.invoiceNumber ||
                          `Bill #${invoicesList[0]?.id}`}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Right: Current Invoice Status and Actions */}
              <div className="flex items-center gap-3">
                {invoiceDetails && invoiceDetails.status && (
                  <Badge
                    variant="outline"
                    className={getStatusColor(invoiceDetails.status)}
                  >
                    {invoiceDetails.status.charAt(0).toUpperCase() +
                      invoiceDetails.status.slice(1)}
                  </Badge>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowCloneDialog(true)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Bill
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "invoice" ? (
              // Show invoice preview
              invoiceDetails ? (
                <InvoicePdfViewer
                  fileUrl={invoiceDetails.fileUrl}
                  sourcePdfUrl={invoiceDetails.sourcePdfUrl}
                />
              ) : (
                <div className="flex items-center justify-center h-full rounded-lg border bg-card">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )
            ) : // Show attachment preview
              isLoading ? (
                <div className="flex items-center justify-center h-full rounded-lg border bg-card">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : attachment && attachment.fileUrl ? (
                <InvoicePdfViewer
                  fileUrl={attachment.fileUrl}
                  sourcePdfUrl={null}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full rounded-lg border bg-card gap-2">
                  <p className="text-muted-foreground">No attachment available</p>
                  {attachment && (
                    <p className="text-xs text-muted-foreground">
                      Attachment ID: {jobId}
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Side - Invoice Details Form */}
        <div className="flex flex-col h-full min-w-0 overflow-hidden pl-2">
          {invoiceDetails && originalInvoiceDetails ? (
            <QuickBooksDataProvider autoLoad={true}>
              <InvoiceDetailsForm
                invoiceDetails={invoiceDetails}
                originalInvoiceDetails={originalInvoiceDetails}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onDetailsChange={handleDetailsChange}
                selectedFields={selectedFields}
                setSelectedFields={setSelectedFields}
                onSave={handleSaveChanges}
                onReject={handleReject}
                onApprove={handleApprove}
                onCancel={handleCancelEdit}
                onFieldChange={() => { }}
                lineItemChangesRef={lineItemChangesRef}
                setInvoicesList={setInvoicesList}
                onApprovalSuccess={() => {
                  // Stay on the same page after approval
                  // Invoice status will be updated via onInvoiceDetailsUpdate
                }}
                onInvoiceDetailsUpdate={(updatedDetails) => {
                  setInvoiceDetails(updatedDetails);
                  setOriginalInvoiceDetails(updatedDetails);
                  // Update the invoice in the list to reflect status change
                  setInvoicesList((prev) =>
                    prev.map((inv) =>
                      inv.id === updatedDetails.id
                        ? { ...inv, status: updatedDetails.status }
                        : inv,
                    ),
                  );
                }}
              />
            </QuickBooksDataProvider>
          ) : (
            <div className="flex items-center justify-center h-full rounded-lg border bg-card">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ResizablePanels>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill page? This action cannot
              be undone.
              {invoiceDetails && (
                <div className="mt-2 text-sm">
                  <strong>Bill:</strong> {invoiceDetails.invoiceNumber || "N/A"}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone Confirmation Dialog */}
      <AlertDialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone Bill Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clone this bill page? This will create a
              duplicate with all line items.
              {invoiceDetails && (
                <div className="mt-2 text-sm">
                  <strong>Bill:</strong> {invoiceDetails.invoiceNumber || "N/A"}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCloning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloneInvoice}
              disabled={isCloning}
            >
              {isCloning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cloning...
                </>
              ) : (
                "Clone"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
