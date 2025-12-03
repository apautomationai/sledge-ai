"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import NewInvoiceButton from "./new-invoice-button";

// Define the type for the props this component expects
interface EmptyStateProps {
  userName: string;
}

/**
 * This component renders the welcome message for new users or users
 * who have not uploaded any invoices yet.
 */
export default function EmptyState({ userName }: EmptyStateProps) {
  return (
    <div className="flex flex-col flex-1 h-full min-h-[800px] items-center justify-center">
      <motion.div
        className="text-center"
        // Animation for a smooth fade-in effect
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted rounded-full">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {/* The dynamic userName prop is used here for a personalized greeting */}
          Welcome to Sledge, {userName}!
        </h2>
        <p className="mt-2 text-muted-foreground">
          You're all set up! Upload your first invoice to get started. It's as easy as 1, 2, 3.
        </p>
        <NewInvoiceButton size="lg" className="mt-6 w-4/5 mx-auto cursor-pointer">
          <UploadCloud className="h-6 w-6 mr-2" />
          Upload our first invoice
        </NewInvoiceButton>
      </motion.div>
    </div>
  );
}
