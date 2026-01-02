import { client } from "@/lib/axios-client";

/**
 * Sync Outlook emails for the currently logged in user
 */
interface OutlookSyncResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function syncOutlookData(): Promise<OutlookSyncResponse> {
  try {
    const response = await client.post<OutlookSyncResponse>("/api/v1/email/outlook/sync");
    return response.data;
  } catch (error) {
    console.error("Error syncing Outlook data:", error);
    throw error;
  }
}

