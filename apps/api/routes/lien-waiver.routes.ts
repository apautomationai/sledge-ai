import { Router } from "express";
import { lienWaiverController } from "@/controllers/lien-wavier.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, lienWaiverController.getAllLienWaivers);
router.post("/upload-lien-waiver", lienWaiverController.uploadLienWaiver);

export default router;
