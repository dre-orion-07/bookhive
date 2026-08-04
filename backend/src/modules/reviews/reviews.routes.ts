import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { createReviewSchema, updateReviewSchema } from "./reviews.schema.js";

const router = Router();

router.get("/book/:bookId", reviewsController.listForBook);
router.get("/user/:userId", reviewsController.listForUser);

router.use(authenticate);

router.post("/", validate(createReviewSchema), reviewsController.create);
router.patch("/:id", validate(updateReviewSchema), reviewsController.update);
router.delete("/:id", reviewsController.delete);
router.post("/:id/like", reviewsController.toggleLike);

export default router;
