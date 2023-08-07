import { Router } from "express";
import { VerifyController } from "@app/controllers/verify/verify-contoller";
const router = Router();
const verifyController = new VerifyController();

router.get("/token", verifyController.verifyToken);

export { router as verifyRouter };
