"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, ChevronDown, ChevronRight, Calendar, MapPin, Image } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import client from "@/lib/axios-client";
import { Badge } from "@workspace/ui/components/badge";

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = parseInt(params.id as string);
    const [project, setProject] = useState<any>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isBillingCycleLoading, setIsBillingCycleLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [expandedVendor, setExpandedVendor] = useState<number | null>(null);
    const [selectedBillingCycle, setSelectedBillingCycle] = useState<string>("full");
    const [availableCycles, setAvailableCycles] = useState<any[]>([]);
    const [showMap, setShowMap] = useState<boolean>(false);

    useEffect(() => {
        fetchProjectDetails(true); // Initial load
    }, [projectId]);

    useEffect(() => {
        if (!isInitialLoading) {
            fetchProjectDetails(false); // Billing cycle change
        }
    }, [selectedBillingCycle]);

    const fetchProjectDetails = async (isInitial: boolean = false) => {
        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsBillingCycleLoading(true);
        }

        try {
            const params = new URLSearchParams();
            if (selectedBillingCycle) {
                params.append('billingCycle', selectedBillingCycle);
            }

            const response = await client.get(`/api/v1/projects/${projectId}?${params.toString()}`);

            if (response.data) {
                setProject(response.data);
                setVendors(response.data.vendors || []);

                // Set initial view: show map if no image, otherwise show image
                if (isInitial) {
                    setShowMap(!response.data.imageUrl && response.data.latitude && response.data.longitude);
                }

                // Set available billing cycles
                if (response.data.billingCycles?.available) {
                    setAvailableCycles(response.data.billingCycles.available);

                    // If this is the initial load and cycles are available, switch to "current"
                    if (isInitial && response.data.billingCycles.available.length > 0 && selectedBillingCycle === "full") {
                        setSelectedBillingCycle("current");
                    }
                } else {
                    setAvailableCycles([]);
                }
            }
        } catch (error: any) {
            toast.error("Failed to load project bill details");
            console.error("Error fetching project:", error);
        } finally {
            if (isInitial) {
                setIsInitialLoading(false);
            } else {
                setIsBillingCycleLoading(false);
            }
        }
    };

    const handleBillingCycleChange = (value: string) => {
        setSelectedBillingCycle(value);
    };

    const toggleVendorRow = (vendorId: number) => {
        if (expandedVendor === vendorId) {
            setExpandedVendor(null);
        } else {
            setExpandedVendor(vendorId);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            failed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
            <Badge className={statusColors[status] || statusColors.pending}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <p className="text-muted-foreground">Loading project bill details...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <h1 className="text-2xl font-bold mb-4">Project Bill Not Found</h1>
                <Button onClick={() => router.push("/project-bills")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Project Bills
                </Button>
            </div>
        );
    }

    const totalVendors = vendors.length;
    const totalVendorInvoices = vendors.reduce((sum, v) => sum + (v.invoiceCount || 0), 0);
    const totalVendorAmount = vendors.reduce((sum, v) => sum + (v.totalInvoiced || 0), 0);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)]">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={() => router.push("/project-bills")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project Bills
            </Button>

            {/* Hero Section */}
            <Card className="overflow-hidden">
                <div className="h-80 relative">
                    {/* Map View */}
                    {(showMap || !project.imageUrl) && project.latitude && project.longitude ? (
                        <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${project.latitude},${project.longitude}&zoom=16`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                        />
                    ) : (
                        /* Image View */
                        <div
                            className="h-full bg-cover bg-center absolute inset-0"
                            style={{
                                backgroundImage: project.imageUrl
                                    ? `url(${project.imageUrl})`
                                    : "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80)",
                            }}
                        />
                    )}

                    {/* Overlay for image view */}
                    {(!showMap && project.imageUrl) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    )}

                    {/* Toggle Button */}
                    {project.imageUrl && project.latitude && project.longitude && (
                        <div className="absolute top-4 right-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowMap(!showMap)}
                                className="bg-white/90 hover:bg-white text-gray-900"
                            >
                                {showMap ? (
                                    <>
                                        <Image className="h-4 w-4 mr-2" />
                                        Show Image
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Show Map
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                                <p className="text-lg text-gray-200">
                                    {project.city && project.state
                                        ? `${project.city}, ${project.state}`
                                        : project.address}
                                </p>
                            </div>
                            <div className="text-white text-right text-sm space-y-1">
                                <div>
                                    <span className="text-gray-300">Project Bill ID:</span> #{project.id}
                                </div>

                                {project.projectStartDate && (
                                    <div>
                                        <span className="text-gray-300">Start Date:</span>{" "}
                                        {new Date(project.projectStartDate).toLocaleDateString()}
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-300">Created:</span>{" "}
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="text-gray-300">Last Activity:</span>{" "}
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Billing Cycle Selector */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Billing Cycle:</span>
                            </div>
                            <Select value={selectedBillingCycle} onValueChange={handleBillingCycleChange}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Select billing cycle" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {availableCycles.length > 0 && (
                                        <SelectItem value="current">Current Cycle</SelectItem>
                                    )}
                                    <SelectItem value="full">All Time</SelectItem>
                                    {availableCycles.map((cycle) => (
                                        <SelectItem key={cycle.id} value={cycle.id}>
                                            {cycle.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {project?.billingCycles?.selectedCycleInfo ? (
                                <>
                                    <span className="font-medium">Selected Period:</span>{" "}
                                    {project.billingCycles.selectedCycleInfo.label}
                                </>
                            ) : selectedBillingCycle === "full" ? (
                                <>
                                    <span className="font-medium">Showing:</span> All invoices
                                </>
                            ) : availableCycles.length === 0 ? (
                                <>
                                    <span className="font-medium">Status:</span>
                                    {!project?.billingCycleStartDate ? (
                                        <span className="ml-1">Project bill not activated</span>
                                    ) : (
                                        <span className="ml-1">No invoices found after project bill start date</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="font-medium">Showing:</span> All available data
                                </>
                            )}
                        </div>
                    </div>

                    {project?.billingCycleStartDate && project?.billingCycleEndDate && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Project Bill Billing Cycle:</span> {" "}
                                {(() => {
                                    const startDate = new Date(project.billingCycleStartDate);
                                    const endDate = new Date(project.billingCycleEndDate);
                                    const startDay = startDate.getDate();
                                    const endDay = endDate.getDate();
                                    const startMonth = startDate.getMonth();
                                    const endMonth = endDate.getMonth();

                                    const getOrdinal = (day: number) => {
                                        if (day > 3 && day < 21) return day + 'th';
                                        switch (day % 10) {
                                            case 1: return day + 'st';
                                            case 2: return day + 'nd';
                                            case 3: return day + 'rd';
                                            default: return day + 'th';
                                        }
                                    };

                                    if (startMonth === endMonth) {
                                        return `${getOrdinal(startDay)} to ${getOrdinal(endDay)} of each month`;
                                    } else {
                                        return `${getOrdinal(startDay)} of each month to ${getOrdinal(endDay)} of next month`;
                                    }
                                })()}
                            </p>
                            {availableCycles.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    No invoices found after project bill start date ({project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'not set'})
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        {isBillingCycleLoading ? (
                            <>
                                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-1 animate-pulse"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl font-bold mb-2">{totalVendorInvoices}</div>
                                <div className="text-sm text-muted-foreground">
                                    {selectedBillingCycle === "full" ? "Total Vendor Invoices" : "Invoices This Period"}
                                </div>
                                {selectedBillingCycle !== "full" && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        All time: {vendors.reduce((sum, v) => sum + (v.totalInvoicesAllTime || 0), 0)}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        {isBillingCycleLoading ? (
                            <>
                                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-1 animate-pulse"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl font-bold mb-2">
                                    ${totalVendorAmount > 0 ? (totalVendorAmount / 1000).toFixed(0) : 0}K
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {selectedBillingCycle === "full" ? "Total Invoiced Amount" : "Amount This Period"}
                                </div>
                                {selectedBillingCycle !== "full" && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        All time: ${vendors.reduce((sum, v) => sum + (v.totalAmountAllTime || 0), 0) > 0
                                            ? (vendors.reduce((sum, v) => sum + (v.totalAmountAllTime || 0), 0) / 1000).toFixed(0)
                                            : 0}K
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        {isBillingCycleLoading ? (
                            <>
                                <div className="h-10 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mt-1 animate-pulse"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl font-bold mb-2">{totalVendors}</div>
                                <div className="text-sm text-muted-foreground">
                                    {selectedBillingCycle === "full" ? "Total Vendors/Subs" : "Active Vendors This Period"}
                                </div>
                                {selectedBillingCycle !== "full" && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Total vendors: {vendors.length}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Summary Table */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            Vendor Summary
                            {selectedBillingCycle !== "full" && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({selectedBillingCycle === "current" ? "Current Billing Cycle" : "Selected Period"})
                                </span>
                            )}
                        </h2>
                        {selectedBillingCycle !== "full" && vendors.some(v => v.invoices?.length === 0) && (
                            <div className="text-sm text-muted-foreground">
                                * Some vendors have no invoices in this period
                            </div>
                        )}
                    </div>
                    {isBillingCycleLoading ? (
                        <div className="space-y-4">
                            {/* Skeleton for table header */}
                            <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                            </div>
                            {/* Skeleton for table rows */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="grid grid-cols-5 gap-4 py-3">
                                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                                </div>
                            ))}
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No vendors found for this project bill</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="text-right">Total Invoiced</TableHead>
                                    <TableHead className="text-right"># Invoices</TableHead>
                                    <TableHead className="text-right">Last Invoice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.map((vendor) => {
                                    const isExpanded = expandedVendor === vendor.id;
                                    const invoices = vendor.invoices || [];

                                    return (
                                        <React.Fragment key={vendor.id}>
                                            <TableRow
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleVendorRow(vendor.id)}
                                            >
                                                <TableCell>
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{vendor?.displayName ?? "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    ${(vendor.totalInvoiced || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {vendor.invoiceCount || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {vendor.lastInvoiceDate
                                                        ? new Date(vendor.lastInvoiceDate).toLocaleDateString()
                                                        : "N/A"}
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="bg-muted/30 p-0">
                                                        <div className="p-4">
                                                            {invoices.length === 0 ? (
                                                                <div className="text-center py-8 text-muted-foreground">
                                                                    No invoices found for this vendor
                                                                </div>
                                                            ) : (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Invoice #</TableHead>
                                                                            <TableHead>Date</TableHead>
                                                                            <TableHead className="text-right">
                                                                                Amount
                                                                            </TableHead>
                                                                            <TableHead>Status</TableHead>
                                                                            <TableHead>Actions</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {invoices.map((invoice: any) => (
                                                                            <TableRow key={invoice.id}>
                                                                                <TableCell>
                                                                                    {invoice.invoiceNumber || `#${invoice.id}`}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {invoice.invoiceDate
                                                                                        ? new Date(
                                                                                            invoice.invoiceDate
                                                                                        ).toLocaleDateString()
                                                                                        : "N/A"}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {invoice.totalAmount
                                                                                        ? `$${parseFloat(
                                                                                            invoice.totalAmount
                                                                                        ).toLocaleString()}`
                                                                                        : "$0"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {getStatusBadge(invoice.status)}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            router.push(
                                                                                                `/jobs/${invoice.attachmentId}?invoiceId=${invoice.id}`
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        Open Details
                                                                                    </Button>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
