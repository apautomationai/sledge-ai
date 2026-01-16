"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover";

interface DatePickerProps {
    value?: string; // Accept string value in YYYY-MM-DD format
    onDateChange?: (dateString: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// Helper function to convert YYYY-MM-DD string to Date object without timezone issues
function stringToDate(dateString: string | undefined): Date | undefined {
    if (!dateString) return undefined;
    try {
        // Parse YYYY-MM-DD as local date to avoid timezone shifts
        const parts = dateString.split('-').map(Number);
        if (parts.length !== 3) return undefined;
        const [year, month, day] = parts;
        if (!year || !month || !day) return undefined;
        return new Date(year, month - 1, day); // month is 0-indexed
    } catch {
        return undefined;
    }
}

// Helper function to convert Date object to YYYY-MM-DD string
function dateToString(date: Date | undefined): string | undefined {
    if (!date) return undefined;
    try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return undefined;
    }
}

export function DatePicker({
    value,
    onDateChange,
    placeholder = "Pick a date",
    disabled = false,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const date = stringToDate(value);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        const dateString = dateToString(selectedDate);
        onDateChange?.(dateString);
        setOpen(false); // Close the popover after selection
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:text-foreground border-gray-300 dark:border-gray-600",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? <span>{value}</span> : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}