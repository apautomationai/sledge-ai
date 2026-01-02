"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    warningMessage?: string;
    associatedInvoice?: {
        invoiceNumber: string;
    };
    isDeleting: boolean;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    warningMessage,
    associatedInvoice,
    isDeleting,
    confirmText = "Delete",
    confirmVariant = "destructive",
}: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                        {associatedInvoice && (
                            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="font-semibold text-destructive">
                                    ⚠️ Warning: This will also delete the associated invoice
                                </p>
                                <div className="mt-2 text-sm">
                                    <p>
                                        <strong>Invoice Number:</strong> {associatedInvoice.invoiceNumber}
                                    </p>
                                </div>
                            </div>
                        )}
                        {warningMessage && !associatedInvoice && (
                            <p className="mt-2 text-destructive">{warningMessage}</p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                        className={
                            confirmVariant === "destructive"
                                ? "bg-destructive hover:bg-destructive/90 text-white"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {confirmText === "Clone" ? "Cloning..." : "Processing..."}
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
