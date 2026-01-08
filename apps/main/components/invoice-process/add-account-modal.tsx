"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
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

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccountCreated: (account: any) => void;
}

export function AddAccountModal({ isOpen, onClose, onAccountCreated }: AddAccountModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        accountType: "",
        accountSubType: "",
    });

    // Common account types for expense accounts (Indirect costs)
    const accountTypes = [
        {
            value: "Expense", label: "Expense", subTypes: [
                { value: "AdvertisingPromotional", label: "Advertising/Promotional" },
                { value: "AutomobileExpense", label: "Automobile" },
                { value: "BadDebt", label: "Bad Debts" },
                { value: "BankCharges", label: "Bank Charges" },
                { value: "CharitableContributions", label: "Charitable Contributions" },
                { value: "CommissionsAndFees", label: "Commissions & Fees" },
                { value: "Entertainment", label: "Entertainment" },
                { value: "EquipmentRental", label: "Equipment Rental" },
                { value: "Insurance", label: "Insurance" },
                { value: "InterestPaid", label: "Interest Paid" },
                { value: "LegalProfessionalFees", label: "Legal & Professional Fees" },
                { value: "Meals", label: "Meals" },
                { value: "OfficeExpenses", label: "Office Expenses" },
                { value: "OfficeGeneralAdministrativeExpenses", label: "Office/General Administrative Expenses" },
                { value: "OtherBusinessExpenses", label: "Other Business Expenses" },
                { value: "OtherMiscellaneousServiceCost", label: "Other Miscellaneous Service Cost" },
                { value: "PromotionalMeals", label: "Promotional Meals" },
                { value: "RentOrLeaseOfBuildings", label: "Rent or Lease of Buildings" },
                { value: "RepairMaintenance", label: "Repair & Maintenance" },
                { value: "ShippingFreightDelivery", label: "Shipping, Freight & Delivery" },
                { value: "SuppliesMaterials", label: "Supplies & Materials" },
                { value: "Travel", label: "Travel" },
                { value: "TravelMeals", label: "Travel Meals" },
                { value: "Utilities", label: "Utilities" },
            ]
        },
    ];

    const selectedAccountType = accountTypes.find(type => type.value === formData.accountType);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subtype when account type changes
            ...(name === 'accountType' && { accountSubType: '' })
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Account name is required");
            return;
        }

        if (!formData.accountType) {
            toast.error("Account type is required");
            return;
        }

        if (!formData.accountSubType) {
            toast.error("Account sub-type is required");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create account in QuickBooks first
            const response = await client.post("/api/v1/quickbooks/accounts", {
                name: formData.name.trim(),
                accountType: formData.accountType,
                accountSubType: formData.accountSubType,
            });

            if (response.data?.success) {
                const newAccount = response.data.data;
                toast.success("Account created successfully");

                // Call the callback to update the dropdown
                onAccountCreated(newAccount);

                // Reset form and close modal
                setFormData({ name: "", accountType: "", accountSubType: "" });
                onClose();
            } else {
                throw new Error(response.data?.message || "Failed to create account");
            }
        } catch (error: any) {
            console.error("Error creating account:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create account";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "", accountType: "", accountSubType: "" });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>
                            Create a new expense account in QuickBooks for indirect costs. This will be synced to your database.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Account Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter account name"
                                required
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accountType">
                                Account Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.accountType}
                                onValueChange={(value) => handleSelectChange('accountType', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accountSubType">
                                Account Sub-Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.accountSubType}
                                onValueChange={(value) => handleSelectChange('accountSubType', value)}
                                disabled={isSubmitting || !formData.accountType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        formData.accountType
                                            ? "Select account sub-type..."
                                            : "Select account type first"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedAccountType?.subTypes.map((subType) => (
                                        <SelectItem key={subType.value} value={subType.value}>
                                            {subType.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                "Create Account"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}