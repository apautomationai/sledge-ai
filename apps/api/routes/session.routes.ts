import { Router } from "express";
import { sessionController } from "@/controllers/session.controller";

const router = Router();

router.post("/get-session", sessionController.getSession);

export default router;
