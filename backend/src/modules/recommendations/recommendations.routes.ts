import { Router } from "express";
import { recommendationsController } from "./recommendations.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", recommendationsController.get);
router.post("/refresh", recommendationsController.refresh);

export default router;
