import { authController } from "@/controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/microsoft", authController.microsoftAuth);
router.get("/microsoft/callback", authController.microsoftCallback);

export default router;

