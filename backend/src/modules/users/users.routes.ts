import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { optionalAuthenticate } from "../../shared/middleware/optionalAuthenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { upload } from "../../shared/middleware/upload.js";
import { updateProfileSchema } from "./users.schema.js";

const router = Router();

// Public routes (optional auth for follow status)
router.get("/username/:username", usersController.getByUsername);
router.get("/profile/:username", optionalAuthenticate, usersController.getPublicProfile);
router.get("/:id", usersController.getById);

// Authenticated routes
router.get("/me/stats", authenticate, usersController.getStats);
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  usersController.updateProfile
);
router.post("/avatar", authenticate, upload.single("avatar"), usersController.uploadAvatar);

export default router;
