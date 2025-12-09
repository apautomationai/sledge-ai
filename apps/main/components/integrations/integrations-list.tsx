"use client";

import React from "react";
import type { Integration } from "./types";
import type { ActionState } from "@/app/(dashboard)/integrations/actions";
import { IntegrationCard } from "./integration-card";
import { BACKEND_NAMES_MAP } from "./integration-constants";

const INITIAL_INTEGRATIONS: Omit<
  Integration,
  "status" | "backendName" | "startReading" | "createdAt" | "lastRead"
>[] = [
    {
      name: "Gmail",
      path: "auth/gmail",
      category: "Email Processing & Automation",
      allowCollection: true,
    },
    {
      name: "Outlook",
      path: "auth/outlook",
      category: "Email Processing & Automation",
      allowCollection: true,
    },
    {
      name: "QuickBooks",
      path: "quickbooks/auth",
      category: "Accounting & Bookkeeping",
      allowCollection: true,
    },
  ];

interface IntegrationsListProps {
  integrations: Array<{
    name: string;
    status: Integration["status"];
    startReading?: string | null;
    createdAt?: string | null;
    lastRead?: string | null;
    email?: string | null;
    providerId?: string | null;
    metadata?: {
      lastErrorMessage?: any;
      [key: string]: any;
    };
  }>;
  updateAction: (formData: FormData) => void;
  updateStartTimeAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  shouldOpenGmailConfig?: boolean;
  onGmailConfigClose?: () => void;
}

export default function IntegrationsList({
  integrations: initialBackendIntegrations,
  updateAction,
  updateStartTimeAction,
  shouldOpenGmailConfig,
  onGmailConfigClose,
}: IntegrationsListProps) {
  const integrations: Integration[] = INITIAL_INTEGRATIONS.map((integration) => {
    const backendName =
      BACKEND_NAMES_MAP[integration.name as keyof typeof BACKEND_NAMES_MAP];
    const existing = initialBackendIntegrations.find((i) => i?.name === backendName);
    return {
      ...integration,
      backendName,
      status: existing?.status || "not_connected",
      startReading: existing?.startReading,
      createdAt: existing?.createdAt,
      lastRead: existing?.lastRead,
      email: existing?.email || null,
      providerId: existing?.providerId || null,
      metadata: existing?.metadata || {},
      errorMessage: existing?.metadata?.lastErrorMessage?.message || existing?.metadata?.lastErrorMessage || null,
    } as Integration;
  });

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.name}
            integration={integration}
            updateAction={updateAction}
            updateStartTimeAction={updateStartTimeAction}
            shouldOpenConfigDialog={integration.backendName === "gmail" && shouldOpenGmailConfig}
            onConfigDialogClose={integration.backendName === "gmail" ? onGmailConfigClose : undefined}
          />
        ))}
      </div>
    </div>
  );
}
