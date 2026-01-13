"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Loader2 } from "lucide-react";
import { client } from "@/lib/axios-client";
import { toast } from "sonner";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductCreated: (product: any) => void;
}

export function AddProductModal({ isOpen, onClose, onProductCreated }: AddProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        unitPrice: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create product in QuickBooks first
            const response = await client.post("/api/v1/quickbooks/items", {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
                type: "Service", // Default to Service type
            });

            if (response.data?.success) {
                const newProduct = response.data.data;
                toast.success("Product created successfully");

                // Call the callback to update the dropdown
                onProductCreated(newProduct);

                // Reset form and close modal
                setFormData({ name: "", description: "", unitPrice: "" });
                onClose();
            } else {
                throw new Error(response.data?.message || "Failed to create product");
            }
        } catch (error: any) {
            console.error("Error creating product:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create product";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "", description: "", unitPrice: "" });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Product/Service</DialogTitle>
                        <DialogDescription>
                            Create a new product or service in QuickBooks. This will be synced to your database.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Product/Service Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter product or service name"
                                required
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter description (optional)"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitPrice">Unit Price ($)</Label>
                            <Input
                                id="unitPrice"
                                name="unitPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.unitPrice}
                                onChange={handleInputChange}
                                placeholder="Enter unit price (optional)"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Product"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}