"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Globe, FileText } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// Mock data
const MOCK_VENDORS = {
    "1": {
        id: 1,
        name: "Northwind Electric",
        type: "Subcontractor",
        contact: {
            name: "Harold Spencer",
            email: "harold@etamble.com",
            phone: "(123) 565-0187",
            website: "www.northwind.com",
        },
        taxId: "99-5766432",
        avatar: "N",
    },
    "2": {
        id: 2,
        name: "Acme Construction",
        type: "General Contractor",
        contact: {
            name: "Laura Mitchell",
            email: "auc@xampo.com",
            phone: "(555) 123-4567",
            website: "www.acmeconstruction.com",
        },
        taxId: "12-3456789",
        avatar: "A",
    },
    "3": {
        id: 3,
        name: "BuildCorp",
        type: "Contractor",
        contact: {
            name: "Joseph Collins",
            email: "jose@exampo.com",
            phone: "(555) 234-5678",
            website: "soneworks.com",
        },
        taxId: "23-4567890",
        avatar: "B",
    },
};

export default function VendorDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vendorId = params?.id as string;

    const vendor = MOCK_VENDORS[vendorId as keyof typeof MOCK_VENDORS] || MOCK_VENDORS["1"];

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "invoices", label: "Invoices" },
        { id: "lien-waivers", label: "Lien Waivers" },
        { id: "projects", label: "Projects" },
        { id: "activity-log", label: "Activity Log" },
        { id: "documents", label: "Documents" },
    ];

    const [activeTab, setActiveTab] = React.useState("overview");

    return (
        <div className="-m-4 -ml-6">
            {/* Back Button */}
            <div className="border-b bg-card">
                <div className="px-6 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Vendors
                    </Button>
                </div>
            </div>

            {/* Header Section */}
            <div className="border-b bg-card">
                <div className="px-6 py-8">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl font-bold text-primary">
                                {vendor.avatar}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold tracking-tight">
                                            {vendor.name}
                                        </h1>                                        
                                    </div>
                                    <p className="text-muted-foreground text-lg">
                                        {vendor.type}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                            {vendor.contact.name}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {vendor.contact.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-muted-foreground">
                                        {vendor.contact.phone}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-muted-foreground">
                                        {vendor.contact.website}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            TAX ID
                                        </div>
                                        <div className="font-medium">{vendor.taxId}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <div className="flex gap-1 border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                    activeTab === tab.id
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 py-8">
                <div className="text-center text-muted-foreground py-12">
                    Content for {tabs.find((t) => t.id === activeTab)?.label} tab will appear here
                </div>
            </div>
        </div>
    );
}