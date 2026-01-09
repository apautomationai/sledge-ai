import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { extractEmail } from "@/helpers/email-helpers";
import crypto from "crypto";
import { uploadBufferToS3 } from "@/helpers/s3upload";
import db from "@/lib/db";
import { attachmentsModel } from "@/models/attachments.model";
import { and, count, desc, eq } from "drizzle-orm";
import { BadRequestError } from "@/helpers/errors";
import { integrationsService } from "./integrations.service";
import { sendAttachmentMessage } from "@/helpers/sqs";
import axios from "axios";


export class OutlookServices {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private pca: ConfidentialClientApplication;

    constructor() {
        this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
        this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
        this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/callback/outlook';
        
        // Validate required environment variables
        if (!this.clientId) {
            throw new Error('MICROSOFT_CLIENT_ID environment variable is required');
        }
        if (!this.clientSecret) {
            throw new Error('MICROSOFT_CLIENT_SECRET environment variable is required');
        }
        
        // Warn if client secret looks like a UUID (secret ID instead of secret value)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(this.clientSecret)) {
            console.warn('WARNING: MICROSOFT_CLIENT_SECRET appears to be a secret ID (UUID) rather than the actual secret value. Please use the secret VALUE from Azure AD, not the secret ID.');
        }

        const msalConfig = {
          auth: {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            authority: "https://login.microsoftonline.com/common",
          },
        };
        
        this.pca = new ConfidentialClientApplication(msalConfig);
    }

  generateAuthUrl = async (state?: string): Promise<string> => {
    const scopes = ["Mail.Read", "offline_access", "User.Read"];
    const redirectUri = this.redirectUri;

    const authCodeUrlParameters = {
      scopes,
      redirectUri,
      ...(state && { state }),
    };

    return await this.pca.getAuthCodeUrl(authCodeUrlParameters);
  };

  getTokensFromCode = async (code: string): Promise<any> => {
    const redirectUri = this.redirectUri;
    
    // Use direct OAuth2 token endpoint to get refresh token
    const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    const params = new URLSearchParams();
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("grant_type", "authorization_code");
    params.append("scope", "Mail.Read offline_access User.Read");

    try {
      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const expiresIn = response.data.expires_in || 3600;
      const expiryDateMs = Date.now() + expiresIn * 1000;

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type || "Bearer",
        expiry_date: expiryDateMs,
      };
    } catch (error: any) {
      // Handle specific Microsoft OAuth errors
      if (error.response?.data?.error === 'invalid_client') {
        const errorDescription = error.response.data.error_description || '';
        if (errorDescription.includes('client secret')) {
          throw new Error(
            'Invalid Microsoft client secret. Please ensure MICROSOFT_CLIENT_SECRET is set to the actual secret VALUE (not the secret ID) from your Azure AD app registration. ' +
            'The secret value is only shown once when you create it in Azure Portal.'
          );
        }
        throw new Error(`Microsoft OAuth error: ${errorDescription || error.response.data.error}`);
      }
      
      // Re-throw with more context
      if (error.response?.data) {
        const errorDescription = error.response.data.error_description || error.response.data.error || 'Unknown error';
        throw new Error(`Failed to exchange authorization code for tokens: ${errorDescription}`);
      }
      
      throw error;
    }
  };

  getUserInfo = async (tokens: any): Promise<{ email: string; providerId: string }> => {
    const client = this.getGraphClient(tokens);
    const user = await client.api("/me").get();
    return {
      email: user.mail || user.userPrincipalName || "",
      providerId: user.id || "",
    };
  };

  getGraphClient = (tokens: any): Client => {
    const client = Client.init({
      authProvider: (done) => {
        done(null, tokens.access_token);
      },
    });
    return client;
  };

  private extractErrorMessage = (
    error: any,
    fallback = "An unknown error occurred"
  ): string => {
    const responseData: any = error?.response?.data || error?.body || {};
    const microsoftError = error?.error || error?.code || "";
    return (
      responseData.error_description ||
      responseData.error?.message ||
      responseData.message ||
      microsoftError ||
      error?.message ||
      String(error) ||
      fallback
    );
  };

  private isAuthOrAccessError = (error: any): boolean => {
    if (!error) return false;
    const message = this.extractErrorMessage(error, "")
      .toString()
      .toLowerCase();
    const status =
      error?.statusCode ?? error?.response?.status ?? error?.status;
    const errorCode = (error?.error?.code || error?.code || "")
      .toString()
      .toLowerCase();

    if (message.includes("invalid_grant")) return true;
    if (message.includes("invalid_token")) return true;
    if (message.includes("unauthorized")) return true;
    if (message.includes("authentication_failed")) return true;
    if (message.includes("token_expired")) return true;
    if (errorCode.includes("invalid_grant") || errorCode.includes("invalid_token"))
      return true;
    if (errorCode.includes("unauthorized_client")) return true;
    if (status === 401 || status === 403) return true;
    return false;
  };

  private async pauseIntegrationWithError(
    integrationId: number,
    message: string,
    metadata: {
      tokenRefreshed: boolean;
      failures: number;
      errorMessage: string | null;
      integrationStatus: string | null;
      errors: {
        stage: string;
        messageId?: string;
        filename?: string | null;
        error: string;
        stack?: string;
      }[];
    }
  ) {
    if (metadata.integrationStatus === "paused") {
      metadata.errorMessage = metadata.errorMessage || message;
      return;
    }

    metadata.integrationStatus = "paused";
    metadata.errorMessage = message;

    try {
      await integrationsService.updateIntegration(integrationId, {
        status: "paused",
        metadata: {
          lastErrorMessage: message,
          lastErrorAt: new Date().toISOString(),
        },
      });
    } catch (updateError: any) {
      metadata.errors.push({
        stage: "pauseIntegration",
        error:
          updateError?.message || "Failed to update integration status to paused",
        stack:
          process.env.NODE_ENV === "development" ? updateError?.stack : undefined,
      });
      metadata.failures++;
    }
  }

  private async handleAuthOrAccessError(
    error: any,
    integrationId: number,
    metadata: {
      tokenRefreshed: boolean;
      failures: number;
      errorMessage: string | null;
      integrationStatus: string | null;
      errors: {
        stage: string;
        messageId?: string;
        filename?: string | null;
        error: string;
        stack?: string;
      }[];
    },
    fallbackMessage: string
  ): Promise<boolean> {
    if (!this.isAuthOrAccessError(error)) {
      return false;
    }
    const message = this.extractErrorMessage(error, fallbackMessage);
    await this.pauseIntegrationWithError(integrationId, message, metadata);
    return true;
  }

  private normalizeExpiryDate = (
    expiry: number | string | Date | null | undefined
  ): number | null => {
    if (!expiry) return null;
    if (typeof expiry === "number") return expiry;
    const date = new Date(expiry);
    const time = date.getTime();
    return Number.isNaN(time) ? null : time;
  };

  private async ensureValidAccessToken(
    tokens: any,
    integrationId: number,
    metadata: {
      tokenRefreshed: boolean;
      errors: {
        stage: string;
        messageId?: string;
        filename?: string | null;
        error: string;
        stack?: string;
      }[];
      failures: number;
      errorMessage: string | null;
      integrationStatus: string | null;
    },
    integrationMetadata?: any
  ): Promise<{
    success: boolean;
    client?: Client;
    message?: string;
  }> {
    const expiryMs = this.normalizeExpiryDate(tokens.expiry_date);
    const needsRefresh =
      !tokens.access_token ||
      !expiryMs ||
      expiryMs <= Date.now() + 60 * 1000;

    if (!needsRefresh) {
      return { success: true, client: this.getGraphClient(tokens) };
    }

    if (!tokens.refresh_token) {
      metadata.failures++;
      metadata.errors.push({
        stage: "tokenRefresh",
        error: "Missing refresh token; cannot refresh access token",
      });
      await this.pauseIntegrationWithError(
        integrationId,
        "Outlook access token expired and refresh token is unavailable",
        metadata
      );
      return {
        success: false,
        message: "Outlook access token expired and refresh token is unavailable",
      };
    }

    try {
      // Refresh token using Microsoft OAuth2 token endpoint
      const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("client_secret", this.clientSecret);
      params.append("refresh_token", tokens.refresh_token);
      params.append("grant_type", "refresh_token");
      params.append("scope", "Mail.Read offline_access User.Read");

      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.data?.access_token) {
        throw new Error("No access token received from refresh");
      }

      const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
      const expiryDateMs = Date.now() + expiresIn * 1000;

      tokens.access_token = response.data.access_token;
      tokens.expiry_date = expiryDateMs;
      if (response.data.refresh_token) {
        tokens.refresh_token = response.data.refresh_token;
      }
      metadata.tokenRefreshed = true;

      // Fetch current metadata if not provided to preserve fields like startReading
      let currentMetadata = integrationMetadata;
      if (!currentMetadata) {
        const integration = await integrationsService.getIntegrationById(integrationId);
        currentMetadata = (integration?.metadata as any) || {};
      }

      await integrationsService.updateIntegration(integrationId, {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || tokens.refresh_token,
        expiryDate: new Date(expiryDateMs),
        metadata: {
          ...currentMetadata,
          lastErrorMessage: null,
          lastErrorAt: new Date().toISOString(),
        },
      });

      return { success: true, client: this.getGraphClient(tokens) };
    } catch (error: any) {
      metadata.failures++;
      metadata.errors.push({
        stage: "tokenRefresh",
        error:
          error?.message || "Failed to refresh Outlook integration access token",
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      });
      await this.handleAuthOrAccessError(
        error,
        integrationId,
        metadata,
        error?.message || "Failed to refresh Outlook integration access token"
      );
      return {
        success: false,
        message:
          error?.message || "Failed to refresh Outlook integration access token",
      };
    }
  }

  getEmailsWithAttachments = async (
    tokens: any,
    userId: number,
    integrationId: number,
    lastRead?: string | null | undefined,
    integrationMetadata?: any
  ) => {
    if (!lastRead) {
      return {
        success: false,
        message: "No last read date",
        data: null,
      };
    }
    const startDate = new Date(lastRead);
    if (isNaN(startDate.getTime())) {
      return {
        success: false,
        message: "Invalid start date",
        data: null,
      };
    }
    const metadata = {
      lastReadUsed: startDate.toISOString(),
      totalMessages: 0,
      processedMessages: 0,
      totalAttachments: 0,
      storedAttachments: 0,
      duplicatesSkipped: 0,
      failures: 0,
      lastProcessedMessageId: null as string | null,
      tokenRefreshed: false,
      errorMessage: null as string | null,
      integrationStatus: null as string | null,
      errors: [] as {
        stage: string;
        messageId?: string;
        filename?: string | null;
        error: string;
        stack?: string;
      }[],
    };
    const results: any[] = [];
    try {
      const authResult = await this.ensureValidAccessToken(
        tokens,
        integrationId,
        metadata,
        integrationMetadata
      );
      if (!authResult.success || !authResult.client) {
        return {
          success: false,
          message:
            authResult.message ||
            "Unable to authenticate with Outlook for this integration",
          data: [],
          metadata,
        };
      }

      const client = authResult.client;
      const startDateTime = startDate.toISOString();

      // Get messages from inbox with attachments, then filter for "invoice" in subject/body
      let messages: any[] = [];
      try {
        // Get messages from inbox with attachments
        const messagesResponse = await client
          .api("/me/mailFolders/inbox/messages")
          .filter(`hasAttachments eq true and receivedDateTime ge ${startDateTime}`)
          // .filter(`hasAttachments eq true`)
          .select("id,subject,receivedDateTime,hasAttachments,from,toRecipients,body")
          .top(100)
          .get();

        // console.log(messagesResponse);

        const allMessages = messagesResponse.value || [];
        // Filter for "invoice" in subject or body
        messages = allMessages.filter((msg: any) => {
          const subject = (msg.subject || "").toLowerCase();
          const body = (msg.body?.content || "").toLowerCase();
          return subject.includes("invoice") || body.includes("invoice");
        });
      } catch (searchError: any) {
        // If search fails, try a simpler approach
        metadata.errors.push({
          stage: "listMessages",
          messageId: undefined,
          filename: null,
          error: this.extractErrorMessage(searchError, "Failed to search messages"),
          stack:
            process.env.NODE_ENV === "development" ? searchError?.stack : undefined,
        });
        throw searchError;
      }

      metadata.totalMessages = messages.length;

      for (const msg of messages) {
        metadata.processedMessages++;
        metadata.lastProcessedMessageId = msg.id || null;
        try {
          // Get full message with attachments
          const message = await client
            .api(`/me/messages/${msg.id}`)
            .expand("attachments")
            .get();

          const sender = extractEmail(
            message.from?.emailAddress?.address || message.from?.emailAddress?.name || ""
          );
          const receiver = extractEmail(
            message.toRecipients?.[0]?.emailAddress?.address ||
              message.toRecipients?.[0]?.emailAddress?.name ||
              ""
          );

          const attachments = message.attachments || [];

          for (const attachment of attachments) {
            // Only process file attachments (not item attachments)
            if (attachment["@odata.type"] !== "#microsoft.graph.fileAttachment") {
              continue;
            }

            metadata.totalAttachments++;
            try {
              // Get attachment content
              const attachmentData = await client
                .api(`/me/messages/${msg.id}/attachments/${attachment.id}`)
                .get();

              if (!attachmentData.contentBytes) {
                throw new Error("Attachment content missing");
              }

              const partInfo = `${msg.id}-${attachment.name}-${attachment.contentType}-${attachment.size}`;
              const hashId = crypto
                .createHash("sha256")
                .update(partInfo)
                .digest("hex");

              const isExists = await this.getAttachmentWithId(hashId, userId);
              if (isExists.length > 0) {
                metadata.duplicatesSkipped++;
                continue;
              }

              const buffer = Buffer.from(attachmentData.contentBytes, "base64");
              const key = `attachments/${hashId}-${attachment.name}`;
              const s3Url = await uploadBufferToS3(
                buffer,
                key,
                attachment.contentType || "application/pdf"
              );
              const s3Key = s3Url!.split(".amazonaws.com/")[1];
              //@ts-ignore
              const [attachmentInfo] = await db.insert(attachmentsModel).values({
                hashId,
                userId,
                emailId: msg.id!,
                filename: attachment.name,
                mimeType: attachment.contentType || "application/octet-stream",
                sender,
                receiver,
                provider: "outlook",
                fileUrl: s3Url,
                fileKey: s3Key,
              }).returning();

              if (attachmentInfo.id) {
                await sendAttachmentMessage(attachmentInfo.id);
              }

              results.push({
                hashId,
                emailId: msg.id,
                filename: attachment.name,
                mimeType: attachment.contentType,
                sender,
                receiver,
                fileUrl: s3Url,
                fileKey: s3Key,
                provider: "outlook",
              });
              metadata.storedAttachments++;
            } catch (partError: any) {
              metadata.failures++;
              metadata.errors.push({
                stage: "attachment",
                messageId: msg.id || undefined,
                filename: attachment.name || null,
                error: this.extractErrorMessage(
                  partError,
                  "Failed to process attachment"
                ),
                stack:
                  process.env.NODE_ENV === "development"
                    ? partError?.stack
                    : undefined,
              });
              if (
                await this.handleAuthOrAccessError(
                  partError,
                  integrationId,
                  metadata,
                  "Failed to process attachment"
                )
              ) {
                return {
                  success: false,
                  message:
                    metadata.errorMessage ||
                    "Integration paused due to authentication error",
                  data: results,
                  metadata,
                };
              }
            }
          }
        } catch (messageError: any) {
          metadata.failures++;
          metadata.errors.push({
            stage: "message",
            messageId: msg.id || undefined,
            error: this.extractErrorMessage(
              messageError,
              "Failed to fetch message"
            ),
            stack:
              process.env.NODE_ENV === "development"
                ? messageError?.stack
                : undefined,
          });
          if (
            await this.handleAuthOrAccessError(
              messageError,
              integrationId,
              metadata,
              "Failed to fetch message"
            )
          ) {
            return {
              success: false,
              message:
                metadata.errorMessage ||
                "Integration paused due to authentication error",
              data: results,
              metadata,
            };
          }
          continue;
        }
      }

      // Update lastReadAt and lastProcessedAt in metadata after entire loop completes
      try {
        const currentIntegration: any = await integrationsService.getIntegrations(userId);
        const integration = (currentIntegration.data || []).find((i: any) => i.id === integrationId);
        const currentMetadata = (integration?.metadata as any) || {};

        const updatedMetadata: any = {
          ...currentMetadata,
          lastReadAt: new Date().toISOString(),
        };

        // Update lastProcessedAt if any attachments were successfully sent to queue
        if (metadata.storedAttachments > 0) {
          updatedMetadata.lastProcessedAt = new Date().toISOString();
        }

        await integrationsService.updateIntegration(integrationId, {
          metadata: updatedMetadata,
        });
      } catch (integrationError: any) {
        metadata.errors.push({
          stage: "updateIntegrationMetadata",
          error:
            integrationError?.message ||
            "Failed to update integration metadata",
          stack:
            process.env.NODE_ENV === "development"
              ? integrationError?.stack
              : undefined,
        });
      }

      const hasErrors = metadata.errors.length > 0 || !!metadata.errorMessage;
      const hasSuccess = metadata.storedAttachments > 0;
      const message =
        metadata.errorMessage ||
        (hasSuccess && hasErrors
          ? "Attachments synced with partial errors"
          : hasSuccess
            ? "Emails synced successfully"
            : hasErrors
              ? "Unable to sync emails"
              : "No new emails found");

      return {
        success: hasSuccess || (!hasSuccess && !hasErrors && metadata.duplicatesSkipped > 0),
        message,
        data: results,
        metadata,
      };
    } catch (error: any) {
      metadata.failures++;
      metadata.errors.push({
        stage: "listMessages",
        error: this.extractErrorMessage(error, "Failed to list messages"),
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      });
      await this.handleAuthOrAccessError(
        error,
        integrationId,
        metadata,
        "Failed to list messages"
      );
      return {
        success: false,
        message: metadata.errorMessage
          ? metadata.errorMessage
          : error instanceof Error
            ? error.message
            : "An unknown error occurred",
        data: [],
        metadata,
      };
    }
  };

  getAttachments = async (userId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    try {
      const attachments = await db
        .select()
        .from(attachmentsModel)
        .where(
          and(
            eq(attachmentsModel.userId, userId),
            eq(attachmentsModel.provider, "outlook"),
            eq(attachmentsModel.isDeleted, false)
          )
        )
        .orderBy(desc(attachmentsModel.created_at))
        .limit(limit)
        .offset(offset);
      const [attachmentCount] = await db
        .select({ count: count() })
        .from(attachmentsModel)
        .where(
          and(
            eq(attachmentsModel.userId, userId),
            eq(attachmentsModel.provider, "outlook"),
            eq(attachmentsModel.isDeleted, false)
          )
        );
      const totalAttachments = attachmentCount.count;
      return { attachments, totalAttachments };
    } catch (error: any) {
      const result = {
        success: false,
        data: error.message,
      };
      return result;
    }
  };

  getAttachmentWithId = async (hashId: string, userId: number) => {
    try {
      const response = await db
        .select()
        .from(attachmentsModel)
        .where(
          and(
            eq(attachmentsModel.hashId, hashId),
            eq(attachmentsModel.userId, userId),
            eq(attachmentsModel.isDeleted, false)
          )
        );
      return response;
    } catch (error: any) {
      throw new BadRequestError(error.message || "No attachment found");
    }
  };
}

export const outlookServices = new OutlookServices();

