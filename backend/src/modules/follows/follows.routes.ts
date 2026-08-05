import { Router } from "express";
import { followsController } from "./follows.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.post("/:userId", followsController.follow);
router.delete("/:userId", followsController.unfollow);
router.get("/followers", followsController.getFollowers);
router.get("/following", followsController.getFollowing);

export default router;
