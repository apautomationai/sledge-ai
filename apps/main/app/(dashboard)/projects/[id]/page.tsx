"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { toast } from "sonner";
import client from "@/lib/axios-client";
import { Badge } from "@workspace/ui/components/badge";

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = parseInt(params.id as string);
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vendors, setVendors] = useState<any[]>([]);
    const [expandedVendor, setExpandedVendor] = useState<number | null>(null);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        setIsLoading(true);
        try {
            const response = await client.get(`/api/v1/projects/${projectId}`);

            if (response.data) {
                setProject(response.data);
                setVendors(response.data.vendors || []);
            }
        } catch (error: any) {
            toast.error("Failed to load project details");
            console.error("Error fetching project:", error);
        } finally {
            setIsLoading(false);
        }
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <p className="text-muted-foreground">Loading project details...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
                <Button onClick={() => router.push("/projects")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    const totalVendors = vendors.length;
    const totalVendorInvoices = vendors.reduce((sum, v) => sum + (v.invoiceCount || 0), 0);
    const totalVendorAmount = vendors.reduce((sum, v) => sum + (v.totalInvoiced || 0), 0);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
            </Button>

            {/* Hero Section */}
            <Card className="overflow-hidden">
                <div
                    className="h-64 bg-cover bg-center relative"
                    style={{
                        backgroundImage: project.imageUrl
                            ? `url(${project.imageUrl})`
                            : "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80)",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
                                    <span className="text-gray-300">Project ID:</span> #{project.id}
                                </div>
                                <div>
                                    <span className="text-gray-300">Creation date:</span>{" "}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold mb-2">{totalVendorInvoices}</div>
                        <div className="text-sm text-muted-foreground">Total Vendor Invoices Received</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold mb-2">
                            ${totalVendorAmount > 0 ? (totalVendorAmount / 1000).toFixed(0) : 0}K
                        </div>
                        <div className="text-sm text-muted-foreground">Total Vendor Invoiced Amount</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold mb-2">{totalVendors}</div>
                        <div className="text-sm text-muted-foreground">Total Vendors/Subs</div>
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Summary Table */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Vendor Summary</h2>
                    {vendors.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No vendors found for this project</p>
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
                                                <TableCell className="font-medium">To do (vendors)</TableCell>
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
