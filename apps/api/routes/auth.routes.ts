import { Router } from "express";

import { authController } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { emailIntegrationController } from "@/controllers/email-integration.controller";
import {
  authRateLimiter,
  authCallbackRateLimiter,
} from "@/middlewares/rate-limit.middleware";

const router = Router();

// User authentication (login) via OAuth providers
router.get("/google", authRateLimiter, authController.googleAuth);
router.get("/google/callback", authCallbackRateLimiter, authController.googleCallback);
router.get("/microsoft", authRateLimiter, authController.microsoftAuth);
router.get("/microsoft/callback", authCallbackRateLimiter, authController.microsoftCallback);

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

