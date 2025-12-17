import { Router } from "express";
import { vendorsController } from "@/controllers/vendors.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";

const router = Router();

router.get("/", authenticate, requireSubscriptionAccess, vendorsController.getVendors);
router.get("/:id", authenticate, requireSubscriptionAccess, vendorsController.getVendorById);

export default router;
