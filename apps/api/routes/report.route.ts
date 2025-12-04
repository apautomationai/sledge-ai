import { Router } from "express";
import { createBugReport } from "@/controllers/report.controller";

const router = Router();

router.post("/", createBugReport);

export default router;
