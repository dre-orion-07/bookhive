import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { registerSchema, loginSchema, googleAuthSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleAuthSchema), authController.googleAuth);
router.get("/me", authenticate, authController.me);

export default router;
