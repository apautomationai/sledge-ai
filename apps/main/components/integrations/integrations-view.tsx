"use client";

import React, { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import IntegrationsList from "./integrations-list";
import type { ActionState } from "@/app/(dashboard)/integrations/actions";
import type { IntegrationStatus } from "./types";
import { IntegrationSuccessDialog } from "./integration-success-dialog";
import { IntegrationConfigAlert } from "./integration-config-alert";

interface IntegrationData {
  name: string;
  status: IntegrationStatus | string;
  startReading?: string | null;
  createdAt?: string | null;
  lastRead?: string | null;
  metadata?: {
    lastErrorMessage?: string | null;
    [key: string]: any;
  };
}

interface IntegrationsViewProps {
  integrations: IntegrationData[];
  searchParams: { [key: string]: string | string[] | undefined };
  updateIntegrationStatusAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  updateStartTimeAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
}

export default function IntegrationsView({
  integrations,
  searchParams,
  updateIntegrationStatusAction,
  updateStartTimeAction,
}: IntegrationsViewProps) {
  const { message, type } = searchParams;
  const [isRedirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [shouldOpenGmailConfig, setShouldOpenGmailConfig] = useState(false);
  const [shouldOpenOutlookConfig, setShouldOpenOutlookConfig] = useState(false);
  const [pendingGmailConfig, setPendingGmailConfig] = useState(false);
  const [pendingOutlookConfig, setPendingOutlookConfig] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string>("");
  const [savedIsSuccess, setSavedIsSuccess] = useState<boolean>(false);
  const [state, formAction] = useActionState(updateIntegrationStatusAction, undefined);

  const isSuccess =
    String(type).toLowerCase().includes("success") ||
    String(message).toLowerCase().includes("successfully");
  const isGmail = String(type).toLowerCase().includes("gmail") ||
    String(message).toLowerCase().includes("gmail");
  const isOutlook = String(type).toLowerCase().includes("outlook") ||
    String(message).toLowerCase().includes("outlook");

  const needsGmailConfig = integrations.some(
    (i) => i.name === "gmail" && i.status === "success" && !i.metadata?.startReading,
  );
  const needOutlookConfig = integrations.some(
    (i) => i.name === "outlook" && i.status === "success" && !i.metadata?.startReading,
  );

  useEffect(() => {
    if (message && type) {
      // Save message, type, and success state before clearing URL
      setSavedMessage(String(message));
      setSavedIsSuccess(isSuccess);

      // Check if this is a successful Gmail integration that needs configuration
      if (isSuccess && isGmail) {
        const gmailIntegration = integrations.find((i) => i.name === "gmail");
        if (
          gmailIntegration &&
          gmailIntegration.status === "success" &&
          !gmailIntegration.metadata?.startReading
        ) {
          // Open config dialog first, then show success after
          setShouldOpenGmailConfig(true);
          setPendingGmailConfig(true);
          // Store in sessionStorage to persist across revalidations
          sessionStorage.setItem('pendingGmailSuccess', JSON.stringify({
            message: String(message),
            isSuccess: isSuccess
          }));
          // Clear URL params immediately
          window.history.replaceState({}, '', '/integrations');
          return;
        }
      }

      // Check if this is a successful Outlook integration that needs configuration
      if (isSuccess && isOutlook) {
        const outlookIntegration = integrations.find((i) => i.name === "outlook");
        if (
          outlookIntegration &&
          outlookIntegration.status === "success" &&
          !outlookIntegration.metadata?.startReading
        ) {
          // Open config dialog first, then show success after
          setShouldOpenOutlookConfig(true);
          setPendingOutlookConfig(true);
          // Store in sessionStorage to persist across revalidations
          sessionStorage.setItem('pendingOutlookSuccess', JSON.stringify({
            message: String(message),
            isSuccess: isSuccess
          }));
          // Clear URL params immediately
          window.history.replaceState({}, '', '/integrations');
          return;
        }
      }

      // For other integrations (like QuickBooks) or already configured, show success dialog
      setRedirectDialogOpen(true);
      // Clear URL params immediately after processing
      window.history.replaceState({}, '', '/integrations');
    }
  }, [message, type, integrations, isSuccess, isGmail, isOutlook]);

  // Check for pending success messages from sessionStorage on mount
  useEffect(() => {
    const pendingGmail = sessionStorage.getItem('pendingGmailSuccess');
    const pendingOutlook = sessionStorage.getItem('pendingOutlookSuccess');

    if (pendingGmail) {
      const data = JSON.parse(pendingGmail);
      setSavedMessage(data.message);
      setSavedIsSuccess(data.isSuccess);
      setRedirectDialogOpen(true);
      sessionStorage.removeItem('pendingGmailSuccess');
    } else if (pendingOutlook) {
      const data = JSON.parse(pendingOutlook);
      setSavedMessage(data.message);
      setSavedIsSuccess(data.isSuccess);
      setRedirectDialogOpen(true);
      sessionStorage.removeItem('pendingOutlookSuccess');
    }
  }, []);

  // Handle opening success dialog after config dialog closes
  const handleGmailConfigClose = () => {
    setShouldOpenGmailConfig(false);

    // Show success dialog after config closes
    if (pendingGmailConfig) {
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        setRedirectDialogOpen(true);
      }, 100);
      setPendingGmailConfig(false);
    }
  };

  const handleOutlookConfigClose = () => {
    setShouldOpenOutlookConfig(false);

    // Show success dialog after config closes
    if (pendingOutlookConfig) {
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        setRedirectDialogOpen(true);
      }, 100);
      setPendingOutlookConfig(false);
    }
  };

  // Handle opening config dialogs after success dialog closes
  const handleSuccessDialogClose = (open: boolean) => {
    setRedirectDialogOpen(open);
  };

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error("An error occurred", { description: state.error });
    } else if (state.success) {
      toast.success(state.message || "Action successful!");

      // Clear URL params after showing toast for disconnect action
      if (state.message?.includes("disconnected")) {
        window.history.replaceState({}, '', '/integrations');
      }
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your platform configuration and integrations.
        </p>
      </div>

      {needsGmailConfig && (
        <IntegrationConfigAlert
          message="Your Gmail account is connected. Please configure the date from which to start processing emails."
        />
      )}

      {needOutlookConfig && (
        <IntegrationConfigAlert
          message="Your Outlook account is connected. Please configure the date from which to start processing emails."
        />
      )}

      <IntegrationsList
        integrations={integrations as Array<{
          name: string;
          status: IntegrationStatus;
          startReading?: string | null;
          createdAt?: string | null;
          lastRead?: string | null;
          email?: string | null;
          providerId?: string | null;
          metadata?: {
            lastErrorMessage?: string | null;
            [key: string]: any;
          };
        }>}
        updateAction={formAction}
        updateStartTimeAction={updateStartTimeAction}
        shouldOpenGmailConfig={shouldOpenGmailConfig}
        onGmailConfigClose={handleGmailConfigClose}
        shouldOpenOutlookConfig={shouldOpenOutlookConfig}
        onOutlookConfigClose={handleOutlookConfigClose}
      />

      {(message || savedMessage) && (
        <IntegrationSuccessDialog
          open={isRedirectDialogOpen}
          onOpenChange={handleSuccessDialogClose}
          message={String(message || savedMessage)}
          isSuccess={message ? isSuccess : savedIsSuccess}
        />
      )}
    </div>
  );
}
