"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Globe, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import client from "@/lib/axios-client";
import { VendorDetailTabs, type VendorDetail } from "@/components/vendors";

export default function VendorDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vendorId = params?.id as string;

    const [vendor, setVendor] = useState<VendorDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "invoices", label: "Invoices", count: vendor?.invoiceCount },
        { id: "lien-waivers", label: "Lien Waivers", count: vendor?.lienWaiverCount },
        { id: "projects", label: "Projects", count: vendor?.projectCount },
    ];

    useEffect(() => {
        if (vendorId) {
            fetchVendor();
        }
    }, [vendorId]);

    const fetchVendor = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response: any = await client.get(`/api/v1/vendors/${vendorId}`);

            if (response.status === "success") {
                setVendor(response.data);
            } else {
                throw new Error(response.error || "Failed to load vendor");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || "Failed to load vendor details";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching vendor:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="-m-4 -ml-6">
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
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading vendor details...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !vendor) {
        return (
            <div className="-m-4 -ml-6">
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
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Failed to load vendor</h2>
                    <p className="text-muted-foreground text-center mb-4">
                        {error || "Vendor not found"}
                    </p>
                    <Button onClick={fetchVendor} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

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
                                {vendor.name?.charAt(0).toUpperCase() || "V"}
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
                                    {vendor.companyName && vendor.companyName !== vendor.name && (
                                        <p className="text-muted-foreground text-lg">
                                            {vendor.companyName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {vendor.contact.name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {vendor.contact.name}
                                            </div>
                                            {vendor.contact.email && (
                                                <div className="text-muted-foreground">
                                                    {vendor.contact.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {vendor.contact.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-muted-foreground">
                                            {vendor.contact.phone}
                                        </div>
                                    </div>
                                )}

                                {vendor.contact.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-muted-foreground">
                                            {vendor.contact.website}
                                        </div>
                                    </div>
                                )}

                                {vendor.taxId && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                TAX ID
                                            </div>
                                            <div className="font-medium">{vendor.taxId}</div>
                                        </div>
                                    </div>
                                )}
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
                                className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
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
                <VendorDetailTabs vendor={vendor} activeTab={activeTab} />
            </div>
        </div>
    );
}