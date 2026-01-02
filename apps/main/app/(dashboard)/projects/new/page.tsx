"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";
import { ArrowLeft, Plus, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";

interface Vendor {
    id: number;
    name: string;
    totalInvoiced: string;
    invoiceCount: string;
    lastInvoice: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const [projectName, setProjectName] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddVendor = () => {
        const newVendor: Vendor = {
            id: Date.now(),
            name: "",
            totalInvoiced: "",
            invoiceCount: "",
            lastInvoice: "",
        };
        setVendors([...vendors, newVendor]);
    };

    const handleRemoveVendor = (id: number) => {
        setVendors(vendors.filter((v) => v.id !== id));
    };

    const handleVendorChange = (id: number, field: keyof Vendor, value: string) => {
        setVendors(
            vendors.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const handleSave = () => {
        if (!projectName.trim()) {
            toast.error("Please enter a project name");
            return;
        }

        // In real app, this would save to API
        toast.success("Project created successfully");
        router.push("/projects");
    };

    return (
        <div className="space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/projects")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                    </Button>
                    <Button onClick={handleSave}>
                        Save Project
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
                                    onClick={() => setImagePreview(null)}
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
                                    Click to upload project image
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
                    <Input
                        placeholder="Add Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="text-2xl font-semibold !bg-transparent border-gray-300 dark:border-gray-600 placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 px-4 py-2 rounded-md"
                    />
                </div>

                {/* Vendor Table */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Vendors</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddVendor}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Vendor
                            </Button>
                        </div>

                        {vendors.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No vendors added yet</p>
                                <p className="text-sm mt-2">Click "Add Vendor" to get started</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Total Invoiced</TableHead>
                                        <TableHead># Invoices</TableHead>
                                        <TableHead>Last Inv.</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendors.map((vendor) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell>
                                                <Input
                                                    placeholder="Vendor name"
                                                    value={vendor.name}
                                                    onChange={(e) =>
                                                        handleVendorChange(vendor.id, "name", e.target.value)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="$0"
                                                    value={vendor.totalInvoiced}
                                                    onChange={(e) =>
                                                        handleVendorChange(
                                                            vendor.id,
                                                            "totalInvoiced",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="0"
                                                    value={vendor.invoiceCount}
                                                    onChange={(e) =>
                                                        handleVendorChange(
                                                            vendor.id,
                                                            "invoiceCount",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Date"
                                                    value={vendor.lastInvoice}
                                                    onChange={(e) =>
                                                        handleVendorChange(
                                                            vendor.id,
                                                            "lastInvoice",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveVendor(vendor.id)}
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
            </div>
        </div>
    );
}
