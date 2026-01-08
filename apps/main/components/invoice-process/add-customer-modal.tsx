"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
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

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCustomerCreated: (customer: any) => void;
}

export function AddCustomerModal({ isOpen, onClose, onCustomerCreated }: AddCustomerModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Customer name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create customer in QuickBooks first
            const response = await client.post("/api/v1/quickbooks/customers", {
                name: formData.name.trim(),
            });

            if (response.data?.success) {
                const newCustomer = response.data.data;
                toast.success("Customer created successfully");

                // Call the callback to update the dropdown
                onCustomerCreated(newCustomer);

                // Reset form and close modal
                setFormData({ name: "" });
                onClose();
            } else {
                throw new Error(response.data?.message || "Failed to create customer");
            }
        } catch (error: any) {
            console.error("Error creating customer:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create customer";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "" });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                            Create a new customer in QuickBooks. This will be synced to your database.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Customer Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter customer name"
                                required
                                disabled={isSubmitting}
                                autoFocus
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
                                "Create Customer"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}