import { client } from "@/lib/axios-client";

/**
 * Sync Gmail emails for the currently logged in user
 */
interface GmailSyncResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function syncGmailData(): Promise<GmailSyncResponse> {
  try {
    const response = await client.post<GmailSyncResponse>("/api/v1/email/gmail/sync");
    return response.data;
  } catch (error) {
    console.error("Error syncing Gmail data:", error);
    throw error;
  }
}

