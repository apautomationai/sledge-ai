import { uploadController } from "@/controllers/upload.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";
import { uploadSingle } from "@/middlewares/multer.middleware";
import { Router } from "express";

const router = Router();

router.get(
  "/upload-attachment",
  authenticate,
  requireSubscriptionAccess,
  uploadController.uploadAttachment
);
router.post("/create-record", authenticate, requireSubscriptionAccess, uploadController.createDbRecord);
router.post("/regenerate", authenticate, requireSubscriptionAccess, uploadController.regenerate);
router.post(
  "/project-image",
  authenticate,
  requireSubscriptionAccess,
  uploadSingle.single("image"),
  uploadController.uploadProjectImage
);

export default router;
