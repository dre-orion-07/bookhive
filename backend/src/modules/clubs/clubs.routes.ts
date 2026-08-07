import { Router } from "express";
import { clubsController } from "./clubs.controller.js";
import {
  createClubSchema,
  createEventSchema,
  updateClubSchema,
  createDiscussionSchema,
  updateDiscussionSchema,
  createCommentSchema,
  updateCommentSchema,
} from "./clubs.schema.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", clubsController.listPublic);
router.post("/", validate(createClubSchema), clubsController.create);
router.get("/:clubId", clubsController.getById);
router.patch("/:clubId", validate(updateClubSchema), clubsController.update);
router.delete("/:clubId", clubsController.delete);
router.post("/:clubId/join", clubsController.join);
router.post("/:clubId/leave", clubsController.leave);
router.get("/:clubId/members", clubsController.listMembers);
router.post("/:clubId/events", validate(createEventSchema), clubsController.createEvent);
router.get("/:clubId/events", clubsController.listUpcomingEvents);

// Discussions
router.get("/:clubId/discussions", clubsController.listDiscussions);
router.post(
  "/:clubId/discussions",
  validate(createDiscussionSchema),
  clubsController.createDiscussion
);
router.get("/:clubId/discussions/:discussionId", clubsController.getDiscussion);
router.patch(
  "/:clubId/discussions/:discussionId",
  validate(updateDiscussionSchema),
  clubsController.updateDiscussion
);
router.delete("/:clubId/discussions/:discussionId", clubsController.deleteDiscussion);

// Comments
router.get("/:clubId/discussions/:discussionId/comments", clubsController.listComments);
router.post(
  "/:clubId/discussions/:discussionId/comments",
  validate(createCommentSchema),
  clubsController.createComment
);
router.patch(
  "/:clubId/discussions/:discussionId/comments/:commentId",
  validate(updateCommentSchema),
  clubsController.updateComment
);
router.delete(
  "/:clubId/discussions/:discussionId/comments/:commentId",
  clubsController.deleteComment
);

// Member management
router.post("/:clubId/members/:userId/promote", clubsController.promoteMember);
router.post("/:clubId/members/:userId/demote", clubsController.demoteMember);
router.post("/:clubId/members/:userId/remove", clubsController.removeMember);
router.post("/:clubId/transfer-ownership/:userId", clubsController.transferOwnership);

export default router;
