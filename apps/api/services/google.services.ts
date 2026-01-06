import { google } from "googleapis";
import { Credentials, OAuth2Client } from "google-auth-library";
import { extractEmail, getHeader } from "@/helpers/email-helpers";
import crypto from "crypto";
import { uploadBufferToS3 } from "@/helpers/s3upload";
import db from "@/lib/db";
import { attachmentsModel } from "@/models/attachments.model";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { BadRequestError } from "@/helpers/errors";
import { integrationsService } from "./integrations.service";
import { sendAttachmentMessage } from "@/helpers/sqs";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export class GoogleServices {
  generateAuthUrl = (state?: string): string => {
    return oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      ...(state && { state }),
    });
  };

  getTokensFromCode = async (code: string): Promise<Credentials> => {
    const { tokens } = await oAuth2Client.getToken(code);
    return tokens;
  };

  getUserInfo = async (tokens: Credentials): Promise<{ email: string; providerId: string }> => {
    const auth = this.getOAuthClient(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth });
    const userInfo = await oauth2.userinfo.get();
    return {
      email: userInfo.data.email || "",
      providerId: userInfo.data.id || "",
    };
  };

  setCredentials = (refreshToken: string): OAuth2Client => {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    //@ts-ignore
    return oAuth2Client;
  };

  getOAuthClient = (tokens: any) => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials(tokens);
    return oAuth2Client;
  };

  private extractErrorMessage = (
    error: any,
    fallback = "An unknown error occurred"
  ): string => {
    const responseData: any = error?.response?.data || {};
    const googleErrors: any[] =
      error?.errors || error?.response?.data?.error?.errors || [];
    const googleMessage =
      googleErrors.length > 0 && googleErrors[0]?.message
        ? googleErrors[0].message
        : null;
    return (
      responseData.error_description ||
      responseData.error ||
      googleMessage ||
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
      error?.response?.status ??
      error?.status ??
      (typeof error?.code === "number" ? error.code : undefined);
    const errorCode =
      (error?.response?.data?.error || error?.code || "")
        .toString()
        .toLowerCase();

    if (message.includes("invalid_grant")) return true;
    if (message.includes("invalid_token")) return true;
    if (message.includes("unauthorized")) return true;
    if (message.includes("auth") && message.includes("fail")) return true;
    if (errorCode.includes("invalid_grant") || errorCode.includes("invalid_token"))
      return true;
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
    client?: OAuth2Client;
    message?: string;
  }> {
    const auth = this.getOAuthClient(tokens);
    const expiryMs = this.normalizeExpiryDate(tokens.expiry_date);
    const needsRefresh =
      !tokens.access_token ||
      !expiryMs ||
      expiryMs <= Date.now() + 60 * 1000;

    if (!needsRefresh) {
      return { success: true, client: auth };
    }

    if (!tokens.refresh_token) {
      metadata.failures++;
      metadata.errors.push({
        stage: "tokenRefresh",
        error: "Missing refresh token; cannot refresh access token",
      });
      await this.pauseIntegrationWithError(
        integrationId,
        "Gmail access token expired and refresh token is unavailable",
        metadata
      );
      return {
        success: false,
        message: "Gmail access token expired and refresh token is unavailable",
      };
    }

    try {
      const accessTokenResponse = await auth.getAccessToken();
      const responseData: any =
        typeof accessTokenResponse === "object"
          ? accessTokenResponse?.res?.data || {}
          : {};
      const accessToken =
        typeof accessTokenResponse === "string"
          ? accessTokenResponse
          : accessTokenResponse?.token || responseData.access_token;
      if (!accessToken) {
        throw new Error("No access token received from refresh");
      }

      let expiryDateMs =
        this.normalizeExpiryDate(auth.credentials.expiry_date) ||
        (typeof responseData.expires_in === "number"
          ? Date.now() + responseData.expires_in * 1000
          : null);

      tokens.access_token = accessToken;
      tokens.expiry_date = expiryDateMs;
      auth.setCredentials({
        ...auth.credentials,
        access_token: accessToken,
        expiry_date: expiryDateMs || undefined,
      });
      metadata.tokenRefreshed = true;

      await integrationsService.updateIntegration(integrationId, {
        accessToken,
        expiryDate: expiryDateMs ? new Date(expiryDateMs) : null,
        metadata: {
          ...integrationMetadata,
          lastErrorMessage: null,
          lastErrorAt: new Date().toISOString(),
        },
      });

      return { success: true, client: auth };
    } catch (error: any) {
      metadata.failures++;
      metadata.errors.push({
        stage: "tokenRefresh",
        error:
          error?.message || "Failed to refresh Gmail integration access token",
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      });
      await this.handleAuthOrAccessError(
        error,
        integrationId,
        metadata,
        error?.message || "Failed to refresh Gmail integration access token"
      );
      return {
        success: false,
        message:
          error?.message || "Failed to refresh Gmail integration access token",
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
            "Unable to authenticate with Gmail for this integration",
          data: [],
          metadata,
        };
      }

      const gmail = google.gmail({ version: "v1", auth: authResult.client });
      const afterTimestamp = Math.floor(startDate.getTime() / 1000);

      const query = `invoice has:attachment label:INBOX after:${afterTimestamp}`;
      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
      });
      const messages = res.data.messages || [];
      metadata.totalMessages = messages.length;

      for (const msg of messages) {
        metadata.processedMessages++;
        metadata.lastProcessedMessageId = msg.id || null;
        try {
          const message = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
          });

          const headers = message.data.payload?.headers || [];
          const sender = extractEmail(getHeader(headers, "from"));
          const receiver = extractEmail(getHeader(headers, "to"));

          const parts = message.data.payload?.parts || [];
          let messageHasEligibleAttachments = false;

          for (const part of parts) {
            if (!part.filename || !part.body?.attachmentId) {
              continue;
            }
            metadata.totalAttachments++;
            try {
              const emailAttachment = await gmail.users.messages.attachments.get({
                userId: "me",
                messageId: msg.id!,
                id: part.body.attachmentId,
              });
              const data = emailAttachment.data.data;
              if (!data) {
                throw new Error("Attachment payload missing");
              }
              const partInfo = `${msg.id}-${part.filename}-${part.mimeType}-${part.body?.size}`;
              const hashId = crypto
                .createHash("sha256")
                .update(partInfo)
                .digest("hex");

              const isExists = await googleServices.getAttachmentWithId(hashId, userId);
              if (isExists.length > 0) {
                metadata.duplicatesSkipped++;
                continue;
              }

              const buffer = Buffer.from(data, "base64url");
              const key = `attachments/${hashId}-${part.filename}`;
              const s3Url = await uploadBufferToS3(
                buffer,
                key,
                part.mimeType || "application/pdf"
              );
              const s3Key = s3Url!.split(".amazonaws.com/")[1];
              //@ts-ignore
              const [attachmentInfo] = await db.insert(attachmentsModel).values({
                hashId,
                userId,
                emailId: msg.id!,
                filename: part.filename,
                mimeType: part.mimeType || "application/octet-stream",
                sender,
                receiver,
                provider: "gmail" as const,
                fileUrl: s3Url,
                fileKey: s3Key,
              }).returning();

              if (attachmentInfo.id) {
                await sendAttachmentMessage(attachmentInfo.id);
              }

              results.push({
                hashId,
                emailId: msg.id,
                filename: part.filename,
                mimeType: part.mimeType,
                sender,
                receiver,
                fileUrl: s3Url,
                fileKey: s3Key,
                provider: "gmail" as const,
              });
              metadata.storedAttachments++;
              messageHasEligibleAttachments = true;
            } catch (partError: any) {
              metadata.failures++;
              metadata.errors.push({
                stage: "attachment",
                messageId: msg.id || undefined,
                filename: part.filename || null,
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

          // Mark email as read if it had eligible attachments that were processed
          if (messageHasEligibleAttachments) {
            try {
              const markReadResult = await this.markEmailAsRead(
                tokens,
                msg.id!,
                integrationId
              );
              if (!markReadResult.success) {
                metadata.errors.push({
                  stage: "markAsRead",
                  messageId: msg.id || undefined,
                  error: markReadResult.message || "Failed to mark email as read",
                });
              }
            } catch (markReadError: any) {
              metadata.errors.push({
                stage: "markAsRead",
                messageId: msg.id || undefined,
                error: this.extractErrorMessage(
                  markReadError,
                  "Failed to mark email as read"
                ),
                stack:
                  process.env.NODE_ENV === "development"
                    ? markReadError?.stack
                    : undefined,
              });
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
            eq(attachmentsModel.isDeleted, false),
            ne(attachmentsModel.status, "skipped")
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
            eq(attachmentsModel.isDeleted, false),
            ne(attachmentsModel.status, "skipped")
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
            eq(attachmentsModel.isDeleted, false),
            ne(attachmentsModel.status, "skipped")
          )
        );
      return response;
    } catch (error: any) {
      throw new BadRequestError(error.message || "No attachment found");
    }
  };

  // Mark email as read
  markEmailAsRead = async (
    tokens: any,
    messageId: string,
    integrationId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const auth = this.getOAuthClient(tokens);
      const gmail = google.gmail({ version: "v1", auth });

      await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: this.extractErrorMessage(error, "Failed to mark email as read"),
      };
    }
  };
}
export const googleServices = new GoogleServices();
