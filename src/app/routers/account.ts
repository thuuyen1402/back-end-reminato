import { Router } from "express";
import { AccountController } from "@app/controllers/account/account-controller";
import { validate } from "@app/middleware/validation";
import { signInSchema } from "@app/controllers/account/account-controller-schema";
import { auth } from "@services/auth";
import { rateLimiter } from "@app/middleware/sercurity";
const router = Router();
const accountController = new AccountController();

router.post("/sign-in", validate(signInSchema), accountController.signIn);
router.get(
  "/me",
  auth.authenticate("jwt", { session: false }),
  accountController.getUserMe
);
router.put(
  "/logout",
  rateLimiter({
    max: 10,
    windowMs: 10 * 60 * 1000, //10 min
  }),
  auth.authenticate("jwt", { session: false }),
  accountController.logout
);
export { router as accountRouter };
