import { Router } from "express";

import { emailIntegrationController } from "@/controllers/email-integration.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";

const router = Router();

// Sync all integrations (typically cron/admin)
router.get(
  "/gmail",
  emailIntegrationController.syncEmailsFor("gmail")
);
router.get(
  "/outlook",
  emailIntegrationController.syncEmailsFor("outlook")
);

// Sync current user's emails
router.get(
  "/gmail/my",
  authenticate,
  emailIntegrationController.syncMyEmailsFor("gmail")
);
router.get(
  "/outlook/my",
  authenticate,
  emailIntegrationController.syncMyEmailsFor("outlook")
);

router.post(
  "/gmail/sync",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.syncMyEmailsFor("gmail")
);
router.post(
  "/outlook/sync",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.syncMyEmailsFor("outlook")
);

// Attachment routes (provider-specific)
router.get(
  "/gmail/attachments",
  authenticate,
  emailIntegrationController.getAttachmentsFor("gmail")
);
router.get(
  "/outlook/attachments",
  authenticate,
  emailIntegrationController.getAttachmentsFor("outlook")
);
router.get(
  "/gmail/attachment/:id",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.getAttachmentWithIdFor("gmail")
);
router.get(
  "/outlook/attachment/:id",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.getAttachmentWithIdFor("outlook")
);

// Provider-agnostic invoice/attachment actions
router.get(
  "/attachments/:id/invoice",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.getAssociatedInvoice
);
router.delete(
  "/attachments/:id",
  authenticate,
  requireSubscriptionAccess,
  emailIntegrationController.deleteAttachment
);

export default router;


