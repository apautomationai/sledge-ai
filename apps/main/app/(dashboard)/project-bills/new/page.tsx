"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { ArrowLeft, Plus, ImagePlus, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { GooglePlacesAutocomplete } from "@/components/ui/google-places-autocomplete";
import { client } from "@/lib/axios-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";

interface Invoice {
    id: number;
    invoiceNumber: string;
    vendorData: {
        id: number;
        displayName: string;
    } | null;
    totalAmount: string;
    invoiceDate: string;
    status: string;
}

interface VendorSummary {
    vendorId: number;
    vendorName: string;
    totalInvoiced: number;
    invoiceCount: number;
    invoiceIds: number[];
}

export default function NewProjectPage() {
    const router = useRouter();
    const [projectName, setProjectName] = useState("");
    const placeDetailsRef = useRef<{
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number;
        longitude: number;
    } | null>(null);
    const [projectStartDate, setProjectStartDate] = useState<string | undefined>(undefined);
    const [billingCycleStartDate, setBillingCycleStartDate] = useState<string | undefined>(undefined);
    const [billingCycleEndDate, setBillingCycleEndDate] = useState<string | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Invoice selection
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
    const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [vendors, setVendors] = useState<VendorSummary[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch invoices when project start date is selected
    useEffect(() => {
        if (projectStartDate) {
            fetchInvoices();
        }
    }, [projectStartDate]);

    const fetchInvoices = async () => {
        if (!projectStartDate) return;

        setIsLoadingInvoices(true);
        try {
            const response = await client.get('/api/v1/invoice/invoices', {
                params: {
                    page: 1,
                    limit: 1000,
                }
            });

            // Handle both response formats
            const allInvoices = response.data.invoices || response.data.data?.invoices || [];

            // Parse project start date (YYYY-MM-DD format)
            const dateParts = projectStartDate.split('-').map(Number);
            if (dateParts.length !== 3) {
                setAvailableInvoices([]);
                return;
            }

            const [startYear, startMonth, startDay] = dateParts;
            if (!startYear || !startMonth || !startDay) {
                setAvailableInvoices([]);
                return;
            }
            const startDate = new Date(startYear, startMonth - 1, startDay);
            startDate.setHours(0, 0, 0, 0);

            // Filter invoices where invoiceDate >= projectStartDate
            const filteredInvoices = allInvoices.filter((invoice: Invoice) => {
                if (!invoice.invoiceDate) return false;

                const invoiceDate = new Date(invoice.invoiceDate);
                invoiceDate.setHours(0, 0, 0, 0);

                return invoiceDate >= startDate;
            });

            setAvailableInvoices(filteredInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to fetch invoices');
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const handleOpenInvoiceDialog = () => {
        if (!projectStartDate) {
            toast.error('Please select a project start date first');
            return;
        }
        setShowInvoiceDialog(true);
    };

    const handleToggleInvoice = (invoice: Invoice) => {
        const isSelected = selectedInvoices.some(inv => inv.id === invoice.id);
        if (isSelected) {
            setSelectedInvoices(selectedInvoices.filter(inv => inv.id !== invoice.id));
        } else {
            setSelectedInvoices([...selectedInvoices, invoice]);
        }
    };

    const handleRemoveInvoice = (invoiceId: number) => {
        setSelectedInvoices(selectedInvoices.filter(inv => inv.id !== invoiceId));
    };

    const handleAddSelectedInvoices = () => {
        setShowInvoiceDialog(false);

        // Extract and aggregate vendors from selected invoices
        const vendorMap = new Map<number, VendorSummary>();

        selectedInvoices.forEach(invoice => {
            if (invoice.vendorData) {
                const vendorId = invoice.vendorData.id;
                const amount = parseFloat(invoice.totalAmount || '0');

                if (vendorMap.has(vendorId)) {
                    const existing = vendorMap.get(vendorId)!;
                    existing.totalInvoiced += amount;
                    existing.invoiceCount += 1;
                    existing.invoiceIds.push(invoice.id);
                } else {
                    vendorMap.set(vendorId, {
                        vendorId,
                        vendorName: invoice.vendorData.displayName,
                        totalInvoiced: amount,
                        invoiceCount: 1,
                        invoiceIds: [invoice.id]
                    });
                }
            }
        });

        setVendors(Array.from(vendorMap.values()));
        toast.success(`${selectedInvoices.length} invoice(s) added to project`);
    };

    const handlePlaceSelect = (place: {
        formattedAddress: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number;
        longitude: number;
    }) => {
        // Store place details in ref for later use when saving
        placeDetailsRef.current = {
            address: place.address || place.formattedAddress,
            city: place.city,
            state: place.state,
            postalCode: place.postalCode,
            country: place.country,
            latitude: place.latitude,
            longitude: place.longitude,
        };
    };

    const handleSave = async () => {
        if (!projectName.trim()) {
            toast.error("Please enter a project bill name");
            return;
        }

        if (!projectStartDate) {
            toast.error("Please select a project start date");
            return;
        }

        if (!billingCycleStartDate || !billingCycleEndDate) {
            toast.error("Please select billing cycle dates");
            return;
        }

        if (selectedInvoices.length === 0) {
            toast.error("Please add at least one invoice to the project");
            return;
        }

        setIsSaving(true);
        try {
            let uploadedImageUrl = null;

            // Upload image if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                const uploadResponse: any = await client.post('/api/v1/upload/project-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (uploadResponse.success) {
                    uploadedImageUrl = uploadResponse.data.imageUrl;
                }
            }

            const response: any = await client.post('/api/v1/projects', {
                name: projectName,
                address: placeDetailsRef.current?.address || projectName,
                city: placeDetailsRef.current?.city || null,
                state: placeDetailsRef.current?.state || null,
                postalCode: placeDetailsRef.current?.postalCode || null,
                country: placeDetailsRef.current?.country || null,
                latitude: placeDetailsRef.current?.latitude || null,
                longitude: placeDetailsRef.current?.longitude || null,
                projectStartDate,
                billingCycleStartDate,
                billingCycleEndDate,
                imageUrl: uploadedImageUrl,
                vendorIds: vendors.map(v => v.vendorId),
                invoiceIds: selectedInvoices.map(inv => inv.id)
            });

            // Axios interceptor returns response.data directly
            if (response.success) {
                toast.success("Project created successfully");
                router.push("/project-bills");
            } else {
                toast.error(response.error || "Failed to create project");
            }
        } catch (error: any) {
            console.error('Error creating project:', error);
            toast.error(error.response?.data?.error || "Failed to create project");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/project-bills")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Project Bills
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Project"}
                    </Button>
                </div>

                {/* Image Upload Section */}
                <Card className="overflow-hidden">
                    <div className="relative h-64 flex items-center justify-center bg-muted/30">
                        {imagePreview ? (
                            <>
                                <img
                                    src={imagePreview}
                                    alt="Project preview"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-4 right-4"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                    <ImagePlus className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <span className="text-muted-foreground text-sm">
                                    Click to upload project bill image
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>
                </Card>

                {/* Project Name */}
                <div className="flex items-center gap-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <GooglePlacesAutocomplete
                        value={projectName}
                        onChange={(value) => {
                            setProjectName(value);
                        }}
                        onPlaceSelect={e => {
                            handlePlaceSelect(e)
                        }}
                        placeholder="Add Project Name / Address"
                        className="text-2xl font-semibold bg-transparent! border-gray-300 dark:border-gray-600 placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 px-4 py-2 rounded-md"
                    />
                </div>

                {/* Project Dates Section */}
                <Card>
                    <div className="p-6 space-y-6">
                        <h2 className="text-xl font-semibold">Project Timeline</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Project Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="projectStartDate" className="text-sm font-medium">
                                    Project Start Date
                                </Label>
                                <DatePicker
                                    value={projectStartDate}
                                    onDateChange={setProjectStartDate}
                                    placeholder="Select start date"
                                    className="w-full"
                                />
                            </div>

                            {/* Billing Cycle Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="billingCycleStartDate" className="text-sm font-medium">
                                    Billing Cycle Start Date
                                </Label>
                                <DatePicker
                                    value={billingCycleStartDate}
                                    onDateChange={setBillingCycleStartDate}
                                    placeholder="Select billing start"
                                    className="w-full"
                                />
                            </div>

                            {/* Billing Cycle End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="billingCycleEndDate" className="text-sm font-medium">
                                    Billing Cycle End Date
                                </Label>
                                <DatePicker
                                    value={billingCycleEndDate}
                                    onDateChange={setBillingCycleEndDate}
                                    placeholder="Select billing end"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Billing Cycle Info */}
                        {billingCycleStartDate && billingCycleEndDate && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Billing Cycle Duration:</span>{" "}
                                    {(() => {
                                        const start = new Date(billingCycleStartDate);
                                        const end = new Date(billingCycleEndDate);
                                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                        return `${days} days`;
                                    })()}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Invoices Section */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Project Invoices</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenInvoiceDialog}
                                disabled={!projectStartDate}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Invoices
                            </Button>
                        </div>

                        {!projectStartDate && (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Please select a project start date first</p>
                                <p className="text-sm mt-2">You'll be able to add invoices after setting the start date</p>
                            </div>
                        )}

                        {projectStartDate && selectedInvoices.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No invoices added yet</p>
                                <p className="text-sm mt-2">Click "Add Invoices" to select invoices for this project</p>
                            </div>
                        )}

                        {selectedInvoices.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                {invoice.invoiceNumber}
                                            </TableCell>
                                            <TableCell>
                                                {invoice.vendorData?.displayName || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                ${parseFloat(invoice.totalAmount || '0').toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${invoice.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    invoice.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveInvoice(invoice.id)}
                                                    className="hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Card>

                {/* Invoice Selection Dialog */}
                <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Select Invoices</DialogTitle>
                            <DialogDescription>
                                Select invoices to add to this project. Only showing invoices from {projectStartDate ? new Date(projectStartDate).toLocaleDateString() : ''} onwards.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto">
                            {isLoadingInvoices ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Loading invoices...</p>
                                </div>
                            ) : availableInvoices.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No invoices found</p>
                                    <p className="text-sm mt-2">
                                        No invoices with date on or after {projectStartDate ? new Date(projectStartDate).toLocaleDateString() : ''}
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {availableInvoices.map((invoice) => {
                                            const isSelected = selectedInvoices.some(inv => inv.id === invoice.id);
                                            return (
                                                <TableRow
                                                    key={invoice.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleToggleInvoice(invoice)}
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleToggleInvoice(invoice)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {invoice.invoiceNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.vendorData?.displayName || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        ${parseFloat(invoice.totalAmount || '0').toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${invoice.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            invoice.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            }`}>
                                                            {invoice.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                {selectedInvoices.length} invoice(s) selected
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowInvoiceDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddSelectedInvoices}
                                    disabled={selectedInvoices.length === 0}
                                >
                                    Add Selected
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
