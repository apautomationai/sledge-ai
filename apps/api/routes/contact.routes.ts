import { Router } from "express";
import { contactController } from "@/controllers/contact.controller";

const router = Router();

// POST /api/v1/contact - Public endpoint, no authentication required
router.post("/", contactController.createContactMessage);

export default router;
