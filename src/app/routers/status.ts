import { Router } from "express";
import { StatusController } from "@app/controllers/status/status-controller";
const router = Router();
const statusController = new StatusController();

router.get("/health", statusController.healthCheck);

export { router as statusRouter };
