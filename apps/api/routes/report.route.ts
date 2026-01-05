import { Router } from "express";
import { reportController } from "@/controllers/report.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { uploadSingle } from "@/middlewares/multer.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  uploadSingle.single("attachment"),
  reportController.createBugReport
);

export default router;
