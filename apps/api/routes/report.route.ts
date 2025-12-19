import { Router } from "express";
import { createBugReport } from "@/controllers/report.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createBugReport);

export default router;
