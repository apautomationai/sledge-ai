"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import {
  Power,
  CircleHelp,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  RefreshCcw,
  Mail,
} from "lucide-react";
import client from "@/lib/axios-client";
import type { Integration } from "./types";
import type { ActionState } from "@/app/(dashboard)/integrations/actions";
import { ConfigureDialog, DisconnectDialog, SubmitButton } from "./integration-dialogs";
import { syncQuickBooksData } from "@/lib/services/quickbooks.service";
import { syncGmailData } from "@/lib/services/gmail.service";
import { syncOutlookData } from "@/lib/services/outlook.service";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { INTEGRATION_LOGOS } from "./integration-constants";
import { IntegrationStatusBadge } from "./integration-status-badge";
import { IntegrationInfoRow } from "./integration-info-row";
import { IntegrationMetadataSection } from "./integration-metadata-section";
import {
  isIntegrationConnected,
  formatDate,
} from "./integration-utils";

interface IntegrationCardProps {
  integration: Integration;
  updateAction: (formData: FormData) => void;
  updateStartTimeAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  shouldOpenConfigDialog?: boolean;
  onConfigDialogClose?: () => void;
}

export function IntegrationCard({
  integration,
  updateAction,
  updateStartTimeAction,
  shouldOpenConfigDialog,
  onConfigDialogClose,
}: IntegrationCardProps) {
  const router = useRouter();
  const {
    name,
    status,
    allowCollection,
    path,
    backendName,
    category,
    createdAt,
    metadata,
    errorMessage,
    email,
  } = integration;

  const isConnected = isIntegrationConnected(status);
  const formId = `form-${backendName}`;
  const isGmail = name.toLowerCase() === "gmail";
  const isOutlook = name.toLowerCase() === "outlook";
  const isQuickBooks = name.toLowerCase() === "quickbooks";
  const IntegrationLogo = INTEGRATION_LOGOS[name];
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const connectedTime = formatDate(createdAt);

  const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/${path}`;
    try {
      const res: any = await client.get(url);
      window.location.href = res.url;
    } catch (error: unknown) {
      const connectErrorMessage =
        error && typeof error === "object" && "response" in error
          ? ((error.response as any)?.data?.message as string) || "Failed to connect!"
          : "Failed to connect!";
      toast.error(connectErrorMessage);
    }
  };

  const handleSync = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      if (isGmail) {
        const result = await syncGmailData();
        toast.success("Gmail sync completed successfully", {
          description: result.message || "Emails synced successfully",
        });

        // Refresh the page data to show updated sync information
        setIsRefreshing(true);
        setTimeout(() => {
          router.refresh();
          setIsRefreshing(false);
        }, 1500);
      } else if (isOutlook) {
        const result = await syncOutlookData();
        toast.success("Outlook sync completed successfully", {
          description: result.message || "Emails synced successfully",
        });

        // Refresh the page data to show updated sync information
        setIsRefreshing(true);
        setTimeout(() => {
          router.refresh();
          setIsRefreshing(false);
        }, 1500);
      } else if (isQuickBooks) {
        const result = await syncQuickBooksData();
        toast.success("Sync completed successfully", {
          description: `Products: ${result.data.products.inserted} inserted, ${result.data.products.updated} updated, ${result.data.products.skipped} skipped. 
                        Accounts: ${result.data.accounts.inserted} inserted, ${result.data.accounts.updated} updated, ${result.data.accounts.skipped} skipped.
                        Vendors: ${result.data.vendors.inserted} inserted, ${result.data.vendors.updated} updated, ${result.data.vendors.skipped} skipped.
                        Customers: ${result.data.customers.inserted} inserted, ${result.data.customers.updated} updated, ${result.data.customers.skipped} skipped.`,
        });

        // Refresh the page data to show updated lastSyncedAt timestamp
        setIsRefreshing(true);
        setTimeout(() => {
          router.refresh();
          setIsRefreshing(false);
        }, 1500); // Wait 1.5 seconds to let user see the success message
      }
    } catch (error: unknown) {
      const syncErrorMessage =
        error && typeof error === "object" && "response" in error
          ? ((error.response as any)?.data?.message as string) || "Failed to sync!"
          : "Failed to sync!";
      toast.error(syncErrorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 w-full h-full">
      <CardHeader className="p-1 sm:p-4 pb-2">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-3">
            {IntegrationLogo && <IntegrationLogo />}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">{name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-1">{category}</CardDescription>
            </div>
          </div>
          <IntegrationStatusBadge status={status} className="pt-0.5 shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="grow space-y-1 p-1 sm:p-2 pt-0">
        {errorMessage && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">Sync Paused</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground border-l-2 pl-2.5 sm:pl-3 py-1">
            <IntegrationInfoRow
              icon={Power}
              label="Connected"
              value={connectedTime}
            />
            {email && (
              <IntegrationInfoRow
                icon={Mail}
                label="Email"
                value={email}
              />
            )}
          </div>
        )}

        <IntegrationMetadataSection metadata={metadata} backendName={backendName} />
      </CardContent>

      <CardFooter className="p-1 sm:p-2 pt-1">
        <form
          id={formId}
          action={updateAction}
          className="flex flex-wrap items-center gap-1 sm:gap-2 w-full"
        >
          <input type="hidden" name="name" value={backendName} />

          {allowCollection ? (
            (status === "not_connected" || status === "disconnected") && (
              <Button size="sm" className="w-full cursor-pointer" onClick={handleConnect}>
                Connect Now
              </Button>
            )
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="w-full cursor-not-allowed">
                    Not Allowed <CircleHelp className="h-4 w-4 ml-2" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This integration is not enabled for your account yet.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {status === "success" && (
            <>
              {(isGmail || isOutlook) && !metadata?.startReading && (
                <ConfigureDialog
                  backendName={backendName}
                  updateStartTimeAction={updateStartTimeAction}
                  defaultOpen={shouldOpenConfigDialog}
                  onOpenChange={(open) => !open && onConfigDialogClose?.()}
                />
              )}
              {(isGmail || isOutlook || isQuickBooks) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing || isRefreshing}
                  className="cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Syncing...
                    </>
                  ) : isRefreshing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" /> Sync
                    </>
                  )}
                </Button>
              )}
              <SubmitButton name="status" value="paused" label="Pause" variant="outline">
                <PauseCircle className="h-4 w-4 mr-2" /> Pause
              </SubmitButton>
              <DisconnectDialog backendName={backendName} formId={formId} />
            </>
          )}

          {status === "paused" && (
            <>
              {(isGmail || isOutlook) && !metadata?.startReading && (
                <ConfigureDialog
                  backendName={backendName}
                  updateStartTimeAction={updateStartTimeAction}
                  defaultOpen={shouldOpenConfigDialog}
                  onOpenChange={(open) => !open && onConfigDialogClose?.()}
                />
              )}
              {(isGmail || isOutlook || isQuickBooks) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing || isRefreshing}
                  className="cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Syncing...
                    </>
                  ) : isRefreshing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" /> Sync
                    </>
                  )}
                </Button>
              )}
              <SubmitButton name="status" value="success" label="Resume" variant="outline">
                <PlayCircle className="h-4 w-4 mr-2 text-green-600" /> Resume
              </SubmitButton>
              <DisconnectDialog backendName={backendName} formId={formId} />
            </>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}
