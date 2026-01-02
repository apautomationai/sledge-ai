import { Router } from "express";

import { authController } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { emailIntegrationController } from "@/controllers/email-integration.controller";

const router = Router();

// User authentication (login) via OAuth providers
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/microsoft", authController.microsoftAuth);
router.get("/microsoft/callback", authController.microsoftCallback);

// Email integration OAuth flows (Gmail & Outlook)
router.get(
  "/gmail",
  authenticate,
  emailIntegrationController.googleAuthRedirect
);
router.get(
  "/gmail/callback",
  emailIntegrationController.googleOAuthCallback
);

router.get(
  "/outlook",
  authenticate,
  emailIntegrationController.outlookAuthRedirect
);
router.get(
  "/outlook/callback",
  emailIntegrationController.outlookOAuthCallback
);

export default router;

