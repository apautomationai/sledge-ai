import { Router } from "express";
import { jobsController } from "@/controllers/jobs.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";

const router = Router();

router.get("/", authenticate, requireSubscriptionAccess, jobsController.getJobs);
router.get("/:id", authenticate, requireSubscriptionAccess, jobsController.getJobById);

export default router;
