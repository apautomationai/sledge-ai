import { Router } from "express";
import { processorController } from "@/controllers/processor.controller";

const router = Router();

// Get attachment info (internal API - no auth required)
router.get("/attachments/:attachmentId", processorController.getAttachmentInfo);
// Update attachment (internal API - no auth required)  
router.patch("/attachments/:attachmentId", processorController.updateAttachment);
// Create invoice (may be called with or without auth)
router.post("/invoices", processorController.createInvoice.bind(processorController));
// Create batch invoices (may be called with or without auth)
router.post("/invoices/batch", processorController.createBatchInvoices.bind(processorController));

router.get("/projects", processorController.getAllProjects);
router.post("/projects", processorController.createProject);

export default router;
