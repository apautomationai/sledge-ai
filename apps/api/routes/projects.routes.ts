import { Router } from "express";
import { projectsController } from "@/controllers/projects.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";

const router = Router();

router.get("/", authenticate, requireSubscriptionAccess, projectsController.getProjects);
router.get("/map", authenticate, requireSubscriptionAccess, projectsController.getProjectsForMap);
router.get("/:id", authenticate, requireSubscriptionAccess, projectsController.getProjectById);
router.delete("/:id", authenticate, requireSubscriptionAccess, projectsController.deleteProject);

export default router;
