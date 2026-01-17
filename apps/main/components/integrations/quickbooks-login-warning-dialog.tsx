"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle } from "lucide-react";

interface QuickBooksLoginWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinue: () => void;
}

export function QuickBooksLoginWarningDialog({
    open,
    onOpenChange,
    onContinue,
}: QuickBooksLoginWarningDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <DialogTitle>Connect to QuickBooks</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4 space-y-3 text-left">
                        <p>
                            <strong>Important:</strong> If you want to connect a different QuickBooks account than the one you're currently logged into:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>First, log out of QuickBooks at <a href="https://accounts.intuit.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">accounts.intuit.com</a></li>
                            <li>Then come back and click "Continue" below</li>
                        </ol>
                        <p className="text-sm text-muted-foreground pt-2">
                            Otherwise, click "Continue" to connect with your currently logged-in QuickBooks account.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onContinue}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
