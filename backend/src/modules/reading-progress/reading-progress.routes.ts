import { Router } from "express";
import { readingProgressController } from "./reading-progress.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { updateProgressSchema } from "./reading-progress.schema.js";

const router = Router();

router.use(authenticate);

router.get("/history", readingProgressController.getHistory);
router.get("/:bookId", readingProgressController.getProgress);
router.patch("/:bookId", validate(updateProgressSchema), readingProgressController.updateProgress);

export default router;
