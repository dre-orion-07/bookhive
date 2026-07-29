import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { upload } from "../../shared/middleware/upload.js";
import { updateProfileSchema } from "./users.schema.js";

const router = Router();

router.get("/:id", usersController.getById);
router.get("/username/:username", usersController.getByUsername);
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  usersController.updateProfile
);
router.post("/avatar", authenticate, upload.single("avatar"), usersController.uploadAvatar);

export default router;
