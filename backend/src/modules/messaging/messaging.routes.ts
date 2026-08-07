import { Router } from "express";
import messagingController from "./messaging.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { createConversationSchema, sendMessageSchema, markReadSchema } from "./messaging.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/conversations",
  validate(createConversationSchema),
  messagingController.createConversation
);
router.get("/conversations", messagingController.listConversations);
router.get("/conversations/:id", messagingController.getConversation);
router.post(
  "/conversations/:id/messages",
  validate(sendMessageSchema),
  messagingController.sendMessage
);
router.get("/conversations/:id/messages", messagingController.getMessages);
router.post("/conversations/:id/read", validate(markReadSchema), messagingController.markRead);

export default router;
