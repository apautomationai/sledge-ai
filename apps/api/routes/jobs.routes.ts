import { Router } from "express";
import { jobsController } from "@/controllers/jobs.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireEmailVerification } from "@/middlewares/email-verified.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";

const router = Router();

router.get("/", authenticate, requireEmailVerification, requireSubscriptionAccess, jobsController.getJobs);
router.get("/:id", authenticate, requireEmailVerification, requireSubscriptionAccess, jobsController.getJobById);

export default router;
