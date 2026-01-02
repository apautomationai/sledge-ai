"use client";

import React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { SignaturePad } from "./signature-pad";

export interface LienWaiverFormData {
    vendorName: string;
    customerName: string;
    jobLocation: string;
    owner: string;
    throughDate: Date | undefined;
    amountOfCheck: string;
    waiverReleaseDate: Date | undefined;
    unpaidProgressAmount: string;
    signature: string | null;
    claimantTitle: string;
    signatureDate: Date | undefined;
}

interface LienWaiverFormFieldsProps {
    formData: LienWaiverFormData;
    onFormDataChange?: (data: Partial<LienWaiverFormData>) => void;
    readOnly?: boolean;
}

export function LienWaiverFormFields({
    formData,
    onFormDataChange,
    readOnly = false,
}: LienWaiverFormFieldsProps) {
    const handleChange = (field: keyof LienWaiverFormData, value: string | Date | null | undefined) => {
        if (onFormDataChange && !readOnly) {
            onFormDataChange({ [field]: value });
        }
    };

    const inputClassName = readOnly
        ? "bg-gray-800/50 border-gray-700 text-white h-9 text-sm cursor-default"
        : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500 h-9 text-sm";

    const buttonClassName = readOnly
        ? "w-full justify-start text-left font-normal h-9 bg-gray-800/50 border-gray-700 text-white cursor-default"
        : "w-full justify-start text-left font-normal h-9 bg-gray-800 border-gray-700 text-white hover:bg-gray-700";

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-6">
            <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-3">
                Lien Waiver Details
            </h2>

            {/* Identifying Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                    Identifying Information
                </h3>

                <div className="space-y-3">
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Vendor Name (Name of Claimant / Check Payable to)</Label>
                        <Input
                            value={formData.vendorName}
                            onChange={(e) => handleChange("vendorName", e.target.value)}
                            placeholder="Camblin Steel Service, Inc."
                            className={inputClassName}
                            readOnly={readOnly}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Customer Name (Name of Customer / Maker of Check)</Label>
                        <Input
                            value={formData.customerName}
                            onChange={(e) => handleChange("customerName", e.target.value)}
                            placeholder="Ferrocrete Builders Inc"
                            className={inputClassName}
                            readOnly={readOnly}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Job Location</Label>
                        <Input
                            value={formData.jobLocation}
                            onChange={(e) => handleChange("jobLocation", e.target.value)}
                            placeholder="242061 Modera Melrose Apts Bldg 3, N Melrose Drive Oceanside, CA"
                            className={inputClassName}
                            readOnly={readOnly}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Owner</Label>
                        <Input
                            value={formData.owner}
                            onChange={(e) => handleChange("owner", e.target.value)}
                            placeholder="Melrose Oceanside Apartments LLC"
                            className={inputClassName}
                            readOnly={readOnly}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Through Date</Label>
                        {readOnly ? (
                            <div className={cn(buttonClassName, "flex items-center px-3")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.throughDate ? format(formData.throughDate, "MM/dd/yyyy") : "-"}
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            buttonClassName,
                                            !formData.throughDate && "text-gray-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.throughDate ? format(formData.throughDate, "MM/dd/yyyy") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.throughDate}
                                        onSelect={(date) => handleChange("throughDate", date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            </div>

            {/* Conditional Waiver Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                    Conditional Waiver and Release
                </h3>

                <div className="space-y-3">
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Amount of Check</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <Input
                                value={formData.amountOfCheck}
                                onChange={(e) => handleChange("amountOfCheck", e.target.value)}
                                placeholder="119,700.00"
                                className={cn(inputClassName, "pl-7")}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exceptions Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                    Exceptions
                </h3>

                <div className="space-y-3">
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Date(s) of Waiver and Release</Label>
                        {readOnly ? (
                            <div className={cn(buttonClassName, "flex items-center px-3")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.waiverReleaseDate ? format(formData.waiverReleaseDate, "MM/dd/yyyy") : "-"}
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            buttonClassName,
                                            !formData.waiverReleaseDate && "text-gray-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.waiverReleaseDate ? format(formData.waiverReleaseDate, "MM/dd/yyyy") : "Select date (optional)"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.waiverReleaseDate}
                                        onSelect={(date) => handleChange("waiverReleaseDate", date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Amount(s) of Unpaid Progress Payment(s)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <Input
                                value={formData.unpaidProgressAmount}
                                onChange={(e) => handleChange("unpaidProgressAmount", e.target.value)}
                                placeholder="Optional"
                                className={cn(inputClassName, "pl-7")}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
                    Signature
                </h3>

                <div className="space-y-3">
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Claimant&apos;s Signature</Label>
                        {readOnly && formData.signature ? (
                            <div className="bg-white rounded p-3 h-24 flex items-center justify-center">
                                <img
                                    src={formData.signature}
                                    alt="Signature"
                                    className="h-full object-contain"
                                />
                            </div>
                        ) : (
                            <SignaturePad
                                signature={formData.signature}
                                onSignatureChange={(sig) => handleChange("signature", sig)}
                                readOnly={readOnly}
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Claimant&apos;s Title</Label>
                        <Input
                            value={formData.claimantTitle}
                            onChange={(e) => handleChange("claimantTitle", e.target.value)}
                            placeholder="A/R Supervisor"
                            className={inputClassName}
                            readOnly={readOnly}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-400 text-xs mb-1 block">Date of Signature</Label>
                        {readOnly ? (
                            <div className={cn(buttonClassName, "flex items-center px-3")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.signatureDate ? format(formData.signatureDate, "MM/dd/yyyy") : "-"}
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            buttonClassName,
                                            !formData.signatureDate && "text-gray-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.signatureDate ? format(formData.signatureDate, "MM/dd/yyyy") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.signatureDate}
                                        onSelect={(date) => handleChange("signatureDate", date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
