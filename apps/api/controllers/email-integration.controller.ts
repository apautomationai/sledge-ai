import { Request, Response } from "express";

import { BadRequestError } from "@/helpers/errors";
import { integrationsService } from "@/services/integrations.service";
import { googleServices } from "@/services/google.services";
import { outlookServices } from "@/services/outlook.services";
import { attachmentServices } from "@/services/attachment.services";
import { invoiceServices } from "@/services/invoice.services";
import { google } from "googleapis";

type Provider = "gmail" | "outlook";

interface EmailProviderConfig {
  name: Provider;
  getAllIntegrations: () => Promise<any>;
  getEmailsWithAttachments: (
    tokens: any,
    userId: number,
    integrationId: number,
    lastRead?: string | null,
    metadata?: any
  ) => Promise<any>;
  getAttachments: (
    userId: number,
    page: number,
    limit: number
  ) => Promise<any>;
  getAttachmentWithId: (id: string, userId: number) => Promise<any>;
}

const providerConfig: Record<Provider, EmailProviderConfig> = {
  gmail: {
    name: "gmail",
    getAllIntegrations: integrationsService.getGmailIntegration,
    getEmailsWithAttachments: googleServices.getEmailsWithAttachments,
    getAttachments: googleServices.getAttachments,
    getAttachmentWithId: googleServices.getAttachmentWithId,
  },
  outlook: {
    name: "outlook",
    getAllIntegrations: integrationsService.getOutlookIntegration,
    getEmailsWithAttachments: outlookServices.getEmailsWithAttachments,
    getAttachments: outlookServices.getAttachments,
    getAttachmentWithId: outlookServices.getAttachmentWithId,
  },
};

const oAuth2ClientGoogle = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export class EmailIntegrationController {
  /**
   * Factory: sync emails for all integrations of a given provider
   * (used by cron/admin endpoints).
   */

  // Google Auth Redirect
  googleAuthRedirect = async (req: Request, res: Response) => {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate state parameter for security (like QuickBooks)
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    const url = googleServices.generateAuthUrl(state);

    // @ts-ignore
    if (req.token) {
      // @ts-ignore
      res.cookie("token", req.token, { httpOnly: true });
    }

    return res.json({ url });
  };

  // Google OAuth Callback
  googleOAuthCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) {
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = "Authorization code is required";
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      // Verify state parameter to get userId
      let userId: number;
      try {
        if (!state) {
          throw new BadRequestError("Missing state parameter");
        }
        const stateData = JSON.parse(
          Buffer.from(state, "base64").toString()
        );
        userId = stateData.userId;
        if (!userId) {
          throw new BadRequestError("Invalid state parameter: missing userId");
        }
      } catch (error: any) {
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = `Invalid state parameter: ${error.message}`;
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      const tokens = await googleServices.getTokensFromCode(code);

      oAuth2ClientGoogle.setCredentials(tokens);

      // Fetch user info from Google to get email and provider_id
      let userInfo;
      try {
        userInfo = await googleServices.getUserInfo(tokens);
      } catch (error: any) {
        console.error("Failed to fetch user info from Google:", error);
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = "Failed to fetch user information from Google";
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      // Check if email already exists in another integration
      if (userInfo.email) {
        const emailExists = await integrationsService.checkEmailExists(userInfo.email, userId);
        if (emailExists) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
          const errorMessage = "This email is already connected to another sledge account. Please disconnect it from that account then try again.";
          const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
          return res.redirect(redirectUrl);
        }
      }

      let integration;

      try {
        const existingIntegration = await integrationsService.checkIntegration(
          userId,
          "gmail"
        );

        const expiryDateValue = tokens.expiry_date
          ? new Date(Number(tokens.expiry_date))
          : null;

        // Only store startReading and scopes in metadata
        // email and providerId have dedicated fields in the integrations table
        const metadata = {
          scopes: tokens.scope ? (Array.isArray(tokens.scope) ? tokens.scope : tokens.scope.split(" ")) : [],
        };

        if (!existingIntegration) {
          integration = await integrationsService.insertIntegration({
            userId: userId,
            name: "gmail",
            status: "success",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenType: tokens.token_type,
            expiryDate: expiryDateValue,
            providerId: userInfo.providerId,
            email: userInfo.email,
            metadata,
          });

          if (!integration.success) {
            // @ts-ignore
            throw new Error(integration?.message);
          }
        } else {
          integration = await integrationsService.updateIntegration(
            existingIntegration.id,
            {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              tokenType: tokens.token_type,
              expiryDate: expiryDateValue,
              providerId: userInfo.providerId,
              email: userInfo.email,
              metadata,
            }
          );
        }
      } catch (error: any) {
        throw new Error(error.message);
      }

      // Redirect to frontend integrations page with success
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/integrations?message=Gmail successfully integrated&type=success`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Integration insert error:", error);
      // Redirect to frontend integrations page with error
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const errorMessage = error.message || "Failed to connect Gmail";
      const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
      return res.redirect(redirectUrl);
    }
  };

  // Outlook Auth Redirect
  outlookAuthRedirect = async (req: Request, res: Response) => {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    const url = await outlookServices.generateAuthUrl(state);

    // @ts-ignore
    if (req.token) {
      // @ts-ignore
      res.cookie("token", req.token, { httpOnly: true });
    }

    return res.json({ url });
  };

  // Outlook OAuth Callback
  outlookOAuthCallback = async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) {
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = "Authorization code is required";
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      // Verify state parameter to get userId
      let userId: number;
      try {
        if (!state) {
          throw new BadRequestError("Missing state parameter");
        }
        const stateData = JSON.parse(
          Buffer.from(state, "base64").toString()
        );
        userId = stateData.userId;
        if (!userId) {
          throw new BadRequestError("Invalid state parameter: missing userId");
        }
      } catch (error: any) {
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = `Invalid state parameter: ${error.message}`;
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      let tokens;
      try {
        tokens = await outlookServices.getTokensFromCode(code);
      } catch (error: any) {
        console.error("Failed to exchange authorization code for tokens:", error);
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = error.message || "Failed to authenticate with Microsoft. Please check your Microsoft OAuth configuration.";
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      // Fetch user info from Microsoft to get email and provider_id
      let userInfo;
      try {
        userInfo = await outlookServices.getUserInfo(tokens);
      } catch (error: any) {
        console.error("Failed to fetch user info from Microsoft:", error);
        const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
        const errorMessage = "Failed to fetch user information from Microsoft";
        const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
        return res.redirect(redirectUrl);
      }

      // Check if email already exists in another integration
      if (userInfo.email) {
        const emailExists = await integrationsService.checkEmailExists(userInfo.email, userId);
        if (emailExists) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
          const errorMessage = "This email is already connected to another sledge account. Please disconnect it from that account then try again.";
          const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
          return res.redirect(redirectUrl);
        }
      }

      let integration;

      try {
        const existingIntegration = await integrationsService.checkIntegration(
          userId,
          "outlook"
        );

        const expiryDateValue = tokens.expiry_date
          ? new Date(Number(tokens.expiry_date))
          : null;

        // Only store scopes in metadata
        // email and providerId have dedicated fields in the integrations table
        const metadata = {
          scopes: ["Mail.ReadWrite", "offline_access", "User.Read"],
        };

        if (!existingIntegration) {
          integration = await integrationsService.insertIntegration({
            userId: userId,
            name: "outlook",
            status: "success",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenType: tokens.token_type,
            expiryDate: expiryDateValue,
            providerId: userInfo.providerId,
            email: userInfo.email,
            metadata,
          });

          if (!integration.success) {
            // @ts-ignore
            throw new Error(integration?.message);
          }
        } else {
          integration = await integrationsService.updateIntegration(
            existingIntegration.id,
            {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              tokenType: tokens.token_type,
              expiryDate: expiryDateValue,
              providerId: userInfo.providerId,
              email: userInfo.email,
              metadata,
            }
          );
        }
      } catch (error: any) {
        throw new Error(error.message);
      }

      // Redirect to frontend integrations page with success
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/integrations?message=Outlook successfully integrated&type=success`;
      return res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Integration insert error:", error);
      // Redirect to frontend integrations page with error
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const errorMessage = error.message || "Failed to connect Outlook";
      const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
      return res.redirect(redirectUrl);
    }
  };

  // Sync Emails for a given provider
  syncEmailsFor(provider: Provider) {
    const cfg = providerConfig[provider];

    return async (_req: Request, res: Response) => {
      const data: any[] = [];
      const metadata = {
        totalIntegrations: 0,
        processedIntegrations: 0,
        totalEmails: 0,
        totalSuccess: 0,
        totalFailed: 0,
        tokenRefreshes: 0,
        totalPaused: 0,
      };

      try {
        const integrationResult: any = await cfg.getAllIntegrations();
        if (!integrationResult.success) {
          throw new BadRequestError(
            `Unable to get ${cfg.name} integration`
          );
        }

        // @ts-ignore
        const integrations = integrationResult.data || [];
        metadata.totalIntegrations = integrations.length;

        for (const integration of integrations) {
          const result: any = {
            integrationId: integration.id,
            userId: integration.userId,
            success: false,
            message: "",
            emailsSynced: 0,
            data: [],
            metadata: null,
            error: null,
            meta: {
              lastRead: integration.lastRead || null,
              startReading: integration.startReading || null,
            },
          };

          try {
            const tokens = {
              access_token: integration.accessToken,
              refresh_token: integration.refreshToken,
              token_type: integration.tokenType,
              expiry_date: integration.expiryDate,
            };

            if (!tokens.access_token) {
              throw new Error("Missing access token");
            }

            // Read lastReadAt from metadata (fallback to lastRead for backward compatibility, then startReading)
            const integrationMetadata = (integration?.metadata as any) || {};
            let lastRead =
              integrationMetadata.lastReadAt || integrationMetadata.lastRead;
            if (!lastRead) {
              lastRead = integrationMetadata.startReading;
            }

            const attachments = await cfg.getEmailsWithAttachments(
              tokens,
              integration.userId,
              integration.id,
              lastRead,
              integrationMetadata
            );

            const emails = attachments.data || [];
            const attachmentMetadata: any = attachments.metadata || {};

            result.data = emails;
            result.metadata = attachmentMetadata;
            result.emailsSynced =
              typeof attachmentMetadata.storedAttachments === "number"
                ? attachmentMetadata.storedAttachments
                : emails.length;
            result.errorMessage = attachmentMetadata.errorMessage || null;
            result.message =
              attachments.message ||
              (attachments.success
                ? "Emails synced successfully"
                : "Unable to sync emails");
            result.success = Boolean(attachments.success);
            result.error =
              Array.isArray(attachmentMetadata.errors) &&
                attachmentMetadata.errors.length > 0
                ? attachmentMetadata.errors
                : null;

            if (attachmentMetadata.tokenRefreshed) {
              metadata.tokenRefreshes++;
            }
            if (attachmentMetadata.integrationStatus === "paused") {
              metadata.totalPaused++;
            }

            if (attachments.success) {
              metadata.totalSuccess++;
              metadata.totalEmails += result.emailsSynced;

              // Update lastReadAt and lastProcessedAt in metadata after successful sync
              try {
                const currentMetadata = (integration.metadata as any) || {};
                const updatedMetadata: any = {
                  ...currentMetadata,
                  lastReadAt: new Date().toISOString(),
                };

                if (attachmentMetadata.storedAttachments > 0) {
                  updatedMetadata.lastProcessedAt = new Date().toISOString();
                }

                await integrationsService.updateIntegration(integration.id, {
                  metadata: updatedMetadata,
                });
              } catch (updateError: any) {
                console.error("Failed to update metadata:", updateError);
                // Don't fail the request if metadata update fails
              }
            } else {
              metadata.totalFailed++;
            }
          } catch (error: any) {
            result.success = false;
            result.message =
              error?.message || "Unexpected error during sync";
            result.error = {
              message: error?.message || "Unknown error",
              stack:
                process.env.NODE_ENV === "development"
                  ? error?.stack
                  : undefined,
            };
            metadata.totalFailed++;
          }

          metadata.processedIntegrations++;
          data.push(result);
        }

        const responseMessage =
          metadata.totalFailed > 0 && metadata.totalSuccess > 0
            ? "Emails synced with partial errors"
            : metadata.totalFailed > 0
              ? "Unable to sync emails for any integration"
              : "Emails synced successfully";

        return res.status(200).json({
          message: responseMessage,
          metadata,
          data,
        });
      } catch (error: any) {
        throw new BadRequestError(
          error.message || `Unable to sync ${cfg.name} emails`
        );
      }
    };
  }

  // Sync Emails for the current user for a given provider
  syncMyEmailsFor(provider: Provider) {
    const cfg = providerConfig[provider];

    return async (req: Request, res: Response) => {
      try {
        // @ts-ignore
        const userId = req.user.id;
        if (!userId) {
          throw new BadRequestError("Need a valid userId");
        }

        const integration = await integrationsService.checkIntegration(
          userId,
          cfg.name
        );

        if (!integration || integration.status !== "success") {
          throw new BadRequestError(
            `${cfg.name === "gmail" ? "Gmail" : "Outlook"} integration not found or not connected`
          );
        }

        const tokens = {
          access_token: integration.accessToken,
          refresh_token: integration.refreshToken,
          token_type: integration.tokenType,
          expiry_date: integration.expiryDate,
        };
        if (!tokens.access_token) {
          throw new BadRequestError("Need valid tokens");
        }

        // Read lastReadAt from metadata (fallback to lastRead for backward compatibility, then startReading)
        const integrationMetadata = (integration.metadata as any) || {};
        let lastRead =
          integrationMetadata.lastReadAt || integrationMetadata.lastRead;
        if (!lastRead) {
          lastRead = integrationMetadata.startReading;
        }
        // Convert to ISO string if it's a date string
        if (lastRead && typeof lastRead === "string") {
          lastRead = new Date(lastRead).toISOString();
        } else if (lastRead) {
          lastRead = lastRead.toISOString();
        }

        const attachments = await cfg.getEmailsWithAttachments(
          tokens,
          integration.userId,
          integration.id,
          lastRead
        );

        // Update lastReadAt and lastProcessedAt in metadata after successful sync
        if (attachments.success) {
          try {
            const currentMetadata = (integration.metadata as any) || {};
            const attachmentMetadata: any = attachments.metadata || {};
            const updatedMetadata: any = {
              ...currentMetadata,
              lastReadAt: new Date().toISOString(),
            };

            if (attachmentMetadata.storedAttachments > 0) {
              updatedMetadata.lastProcessedAt = new Date().toISOString();
            }

            await integrationsService.updateIntegration(integration.id, {
              metadata: updatedMetadata,
            });
          } catch (updateError: any) {
            console.error("Failed to update metadata:", updateError);
            // Don't fail the request if metadata update fails
          }
        }

        return res.status(200).json({
          message: "Emails synced successfully",
          data: attachments || [],
        });
      } catch (error: any) {
        throw new BadRequestError(
          error.message || "Unable to sync emails"
        );
      }
    };
  }

  // Get Attachments (provider-specific)
  getAttachmentsFor(provider: Provider) {
    const cfg = providerConfig[provider];

    return async (req: Request, res: Response) => {
      // @ts-ignore
      const userId = req.user.id;
      if (!userId) {
        throw new BadRequestError("Need a valid userId");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      try {
        const attachmentsData = await cfg.getAttachments(
          userId,
          page,
          limit
        );

        const result = {
          status: "success",
          data: {
            // @ts-ignore
            attachments: attachmentsData.attachments,
            pagination: {
              // @ts-ignore
              totalAttachments: attachmentsData.totalAttachments || 0,
              page,
              limit,
              // @ts-ignore
              totalPages: Math.ceil(
                (attachmentsData.totalAttachments || 0) / limit
              ),
            },
          },
        };

        res.status(200).send(result);
      } catch (error: any) {
        throw new BadRequestError(
          error.message || "Failed to get attachments"
        );
      }
    };
  }

  // Get Attachment By Id (provider-specific)
  getAttachmentWithIdFor(provider: Provider) {
    const cfg = providerConfig[provider];

    return async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        if (!id) {
          throw new BadRequestError("No id found");
        }
        // @ts-ignore
        const userId = req.user.id;
        if (!userId) {
          throw new BadRequestError("User ID is required");
        }

        const response = await cfg.getAttachmentWithId(id, userId);
        const att = response[0];

        // NOTE:
        // The existing controllers for Google and Outlook both hydrate file data
        // from S3 using GetObjectCommand + streamToBuffer. That logic is shared
        // and provider-agnostic, so we keep it here in one place.
        const s3Key = att.fileUrl!.split(".amazonaws.com/")[1];
        const command = new (require("@aws-sdk/client-s3")
          .GetObjectCommand as any)({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: s3Key,
          });
        const s3Client = require("@/helpers/s3upload").s3Client as any;
        const streamToBuffer =
          require("@/lib/utils/steamToBuffer").streamToBuffer;

        const s3Object = await s3Client.send(command);
        // @ts-ignore
        const buffer = s3Object.Body
          ? await streamToBuffer(s3Object.Body)
          : null;
        const fileData = buffer?.toString("base64") || null;

        const result = {
          status: "success",
          data: {
            ...att,
            fileData,
          },
        };

        return res.status(200).send(result);
      } catch (error: any) {
        const result = {
          status: false,
          data: error.message,
        };
        return res.send(result);
      }
    };
  }

  // Get Associated Invoices
  getAssociatedInvoice = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user.id;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const attachmentId = parseInt(req.params.id, 10);
      if (isNaN(attachmentId) || attachmentId <= 0) {
        throw new BadRequestError(
          "Attachment ID must be a valid positive number"
        );
      }

      const attachment =
        await attachmentServices.getAttachmentById(attachmentId);

      if (!attachment) {
        throw new BadRequestError("Attachment not found");
      }

      if (attachment.userId !== userId) {
        throw new BadRequestError(
          "Not authorized to access this attachment"
        );
      }

      const associatedInvoice =
        await attachmentServices.getAssociatedInvoice(attachmentId);

      if (!associatedInvoice) {
        return res.status(404).json({
          success: false,
          message: "No associated invoice found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: associatedInvoice.id,
          invoiceNumber: associatedInvoice.invoiceNumber,
        },
      });
    } catch (error: any) {
      console.error("Error getting associated invoice:", error);

      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  };

  // Delete Attachment
  deleteAttachment = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user.id;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const attachmentId = parseInt(req.params.id, 10);
      if (isNaN(attachmentId) || attachmentId <= 0) {
        throw new BadRequestError(
          "Attachment ID must be a valid positive number"
        );
      }

      const attachment =
        await attachmentServices.getAttachmentById(attachmentId);

      if (!attachment) {
        throw new BadRequestError("Attachment not found");
      }

      if (attachment.userId !== userId) {
        throw new BadRequestError(
          "Not authorized to delete this attachment"
        );
      }

      const associatedInvoice =
        await attachmentServices.getAssociatedInvoice(attachmentId);

      await attachmentServices.softDeleteAttachment(attachmentId);

      if (associatedInvoice) {
        await invoiceServices.softDeleteInvoice(associatedInvoice.id);
      }

      return res.status(200).json({
        success: true,
        message: "Attachment deleted successfully",
        deletedInvoice: associatedInvoice
          ? {
            id: associatedInvoice.id,
            invoiceNumber: associatedInvoice.invoiceNumber,
          }
          : null,
      });
    } catch (error: any) {
      console.error("Error deleting attachment:", error);

      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  };
}

export const emailIntegrationController = new EmailIntegrationController();


