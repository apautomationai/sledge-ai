import React, { Suspense } from "react";
import IntegrationsView from "@/components/integrations/integrations-view";
import client from "@/lib/fetch-client";
import {
  updateIntegrationStatusAction,
  updateStartTimeAction,
} from "@/app/(dashboard)/integrations/actions";

export const dynamic = "force-dynamic";

interface IntegrationData {
  name: string;
  status: string;
  startReading?: string | null;
  createdAt?: string | null;
  lastRead?: string | null;
  email?: string | null;
  providerId?: string | null;
  metadata?: Record<string, any>;
}

interface IntegrationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getIntegrations(): Promise<IntegrationData[]> {
  try {
    const response = await client.get("api/v1/settings/integrations");
    // console.log("response", response.data.some(i => i.name=='gmail'));
    return response?.data || [];
  } catch (error) {
    return [];
  }
}

export default async function IntegrationsPage({
  searchParams: searchParamsPromise,
}: IntegrationsPageProps) {
  const searchParams = await searchParamsPromise;
  const integrations = await getIntegrations();

  return (
    <>
      <Suspense fallback={<IntegrationsSkeleton />}>
        <IntegrationsView
          integrations={integrations}
          searchParams={searchParams}
          updateIntegrationStatusAction={updateIntegrationStatusAction}
          updateStartTimeAction={updateStartTimeAction}
        />
      </Suspense>
    </>
  );
}


const IntegrationsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-10 w-48 bg-muted rounded-md animate-pulse"></div>
    <div className="border rounded-lg p-6">
      <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse mb-2"></div>
      <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse"></div>
    </div>
  </div>
);

