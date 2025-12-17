"use client";

import React from "react";

export interface Project {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    imageUrl: string | null;
    totalInvoiced: number | null;
    invoiceCount: number | null;
    firstInvoiceDate: string | null;
    lastInvoiceDate: string | null;
}

export interface Invoice {
    id: number;
    invoiceNumber: string | null;
    vendorName: string | null;
    customerName: string | null;
    invoiceDate: string | null;
    dueDate: string | null;
    totalAmount: number | null;
    currency: string | null;
    status: string | null;
    fileUrl: string | null;
    createdAt: string | null;
}

export interface LienWaiver {
    id: number;
    projectId: number | null;
    projectName: string | null;
    projectAddress: string | null;
    waiverType: string | null;
    billingCycle: string | null;
    throughDate: string | null;
    vendorName: string | null;
    vendorEmail: string | null;
    customerName: string | null;
    amount: number | null;
    isSigned: boolean | null;
    signedAt: string | null;
    signedFileUrl: string | null;
    createdAt: string | null;
}

export interface VendorContact {
    name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
}

export interface VendorAddress {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
}

export interface VendorDetail {
    id: number;
    name: string;
    displayName: string | null;
    companyName: string | null;
    contact: VendorContact;
    taxId: string | null;
    address: VendorAddress;
    projects: Project[];
    invoices: Invoice[];
    lienWaivers: LienWaiver[];
    projectCount: number;
    invoiceCount: number;
    lienWaiverCount: number;
    active: boolean | null;
    balance: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}

interface VendorDetailTabsProps {
    vendor: VendorDetail;
    activeTab: string;
}

const formatCurrency = (amount: number | null, currency: string | null = "USD") => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
    }).format(amount);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function OverviewTab({ vendor }: { vendor: VendorDetail }) {
    return (
        <h2 className="text-center py-12 text-muted-foreground">
            Overview content coming soon for {vendor.name}
        </h2>
    );
}

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
    if (invoices.length === 0) {
        return (
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="text-center py-12 text-muted-foreground">
                    No invoices found for this vendor
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium">Invoice #</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Due Date</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Amount</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 text-sm font-medium">
                                    {invoice.invoiceNumber || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {formatDate(invoice.invoiceDate)}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {formatDate(invoice.dueDate)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        invoice.status === "paid"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : invoice.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    }`}>
                                        {invoice.status || "Unknown"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LienWaiversTab({ lienWaivers }: { lienWaivers: LienWaiver[] }) {
    if (lienWaivers.length === 0) {
        return (
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="text-center py-12 text-muted-foreground">
                    No lien waivers found for this vendor
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium">Project</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Through Date</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Amount</th>
                            <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {lienWaivers.map((waiver) => (
                            <tr key={waiver.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 text-sm">
                                    <div className="font-medium">{waiver.projectName || "-"}</div>
                                    <div className="text-xs text-muted-foreground">{waiver.projectAddress || ""}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {waiver.waiverType || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {formatDate(waiver.throughDate)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {formatCurrency(waiver.amount)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        waiver.isSigned
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}>
                                        {waiver.isSigned ? "Signed" : "Pending"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProjectsTab({ projects }: { projects: Project[] }) {
    if (projects.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No projects found for this vendor
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <div key={project.id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold mb-2">{project.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        {[project.address, project.city, project.state]
                            .filter(Boolean)
                            .join(", ") || "No address"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Total Invoiced</p>
                            <p className="font-medium">{formatCurrency(project.totalInvoiced)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Invoices</p>
                            <p className="font-medium">{project.invoiceCount || 0}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function VendorDetailTabs({ vendor, activeTab }: VendorDetailTabsProps) {
    switch (activeTab) {
        case "overview":
            return <OverviewTab vendor={vendor} />;
        case "invoices":
            return <InvoicesTab invoices={vendor.invoices} />;
        case "lien-waivers":
            return <LienWaiversTab lienWaivers={vendor.lienWaivers} />;
        case "projects":
            return <ProjectsTab projects={vendor.projects} />;
        default:
            return null;
    }
}
