import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { notificationsController } from "./notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", notificationsController.list);
router.get("/unread-count", notificationsController.unreadCount);
router.get("/unread", notificationsController.unread);
router.patch("/read-all", notificationsController.markAllRead);
router.patch("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.delete);

export default router;
