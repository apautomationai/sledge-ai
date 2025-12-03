"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft } from "lucide-react";
import { PLACEHOLDER_PROJECTS } from "@/lib/data/projects";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { ChevronDown, ChevronRight } from "lucide-react";

// Placeholder vendor data
const VENDOR_DATA = [
    {
        id: 1,
        vendor: "Camblin Steel Service, Inc.",
        totalInvoiced: 214000,
        invoiceCount: 4,
        lastInvoice: "Jan 23",
        invoices: [
            { id: 101, date: "Jan 23", amount: 75000, status: "Paid" },
            { id: 102, date: "Jan 15", amount: 50000, status: "Paid" },
            { id: 103, date: "Jan 08", amount: 54000, status: "Pending" },
            { id: 104, date: "Dec 28", amount: 35000, status: "Paid" },
        ],
    },
    {
        id: 2,
        vendor: "Van Marre Lumber Co.",
        totalInvoiced: 115000,
        invoiceCount: 3,
        lastInvoice: "Jan 28",
        invoices: [
            { id: 201, date: "Jan 28", amount: 45000, status: "Paid" },
            { id: 202, date: "Jan 20", amount: 40000, status: "Pending" },
            { id: 203, date: "Jan 12", amount: 30000, status: "Paid" },
        ],
    },
    {
        id: 3,
        vendor: "White Cap",
        totalInvoiced: 78000,
        invoiceCount: 2,
        lastInvoice: "Jan 31",
        invoices: [
            { id: 301, date: "Jan 31", amount: 45000, status: "Paid" },
            { id: 302, date: "Jan 18", amount: 33000, status: "Paid" },
        ],
    },
];

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = parseInt(params.id as string);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const project = PLACEHOLDER_PROJECTS.find((p) => p.id === projectId);

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

    const totalVendorInvoices = VENDOR_DATA.reduce((sum, v) => sum + v.invoiceCount, 0);
    const totalVendorAmount = VENDOR_DATA.reduce((sum, v) => sum + v.totalInvoiced, 0);
    const totalVendors = VENDOR_DATA.length;

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

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
                    style={{ backgroundImage: `url(${project.imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-4xl font-bold mb-2">{project.address}</h1>
                                <p className="text-lg text-gray-200">
                                    GC: MCRT SoCal Construction &nbsp;&nbsp; Owner: Marques Oceanside
                                </p>
                            </div>
                            <div className="text-white text-right text-sm space-y-1">
                                <div>
                                    <span className="text-gray-300">Project ID:</span> PP-00324
                                </div>
                                <div>
                                    <span className="text-gray-300">Creation date:</span> Feb 1 2024
                                </div>
                                <div>
                                    <span className="text-gray-300">Last Activity:</span> Feb 18 2024
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
                            ${(totalVendorAmount / 1000).toFixed(0)},000
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-right">Total Invoiced</TableHead>
                                <TableHead className="text-right"># Invoices</TableHead>
                                <TableHead className="text-right">Last Inv.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {VENDOR_DATA.map((vendor) => (
                                <React.Fragment key={vendor.id}>
                                    <TableRow
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => toggleRow(vendor.id)}
                                    >
                                        <TableCell>
                                            {expandedRow === vendor.id ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{vendor.vendor}</TableCell>
                                        <TableCell className="text-right">
                                            ${vendor.totalInvoiced.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">{vendor.invoiceCount}</TableCell>
                                        <TableCell className="text-right">{vendor.lastInvoice}</TableCell>
                                    </TableRow>
                                    {expandedRow === vendor.id && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="bg-muted/30 p-0">
                                                <div className="p-4">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Invoice ID</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {vendor.invoices.map((invoice) => (
                                                                <TableRow key={invoice.id}>
                                                                    <TableCell>#{invoice.id}</TableCell>
                                                                    <TableCell>{invoice.date}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        ${invoice.amount.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span
                                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${invoice.status === "Paid"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : "bg-yellow-100 text-yellow-800"
                                                                                }`}
                                                                        >
                                                                            {invoice.status}
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
