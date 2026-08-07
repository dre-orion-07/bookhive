import type { NextFunction, Response } from "express";
import { clubsService } from "./clubs.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";
import type {
  CreateClubInput,
  CreateEventInput,
  UpdateClubInput,
  CreateDiscussionInput,
  UpdateDiscussionInput,
  CreateCommentInput,
  UpdateCommentInput,
} from "./clubs.schema.js";

function getUserId(req: AuthenticatedRequest) {
  const userId = req.user?.userId;
  if (!userId) {
    throw ErrorFactory.authenticationFailed("Authentication token is required.");
  }

  return userId;
}

function getClubId(req: AuthenticatedRequest) {
  const { clubId } = req.params;
  if (typeof clubId !== "string" || clubId.length === 0) {
    throw ErrorFactory.validation("Club ID is required.");
  }

  return clubId;
}

export const clubsController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const club = await clubsService.create(getUserId(req), req.body as CreateClubInput);
      return sendSuccess(res, club, "Book club created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const club = await clubsService.getById(getClubId(req), getUserId(req));
      return sendSuccess(res, club, "Book club retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const club = await clubsService.update(
        getClubId(req),
        getUserId(req),
        req.body as UpdateClubInput
      );
      return sendSuccess(res, club, "Book club updated successfully.");
    } catch (err) {
      return next(err);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await clubsService.delete(getClubId(req), getUserId(req));
      return sendSuccess(res, null, "Book club deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listPublic: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clubs = await clubsService.listPublic();
      return sendSuccess(res, clubs, "Public book clubs retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  join: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const membership = await clubsService.join(getClubId(req), getUserId(req));
      return sendSuccess(res, membership, "Joined book club successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  leave: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await clubsService.leave(getClubId(req), getUserId(req));
      return sendSuccess(res, null, "Left book club successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listMembers: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const members = await clubsService.listMembers(getClubId(req), getUserId(req));
      return sendSuccess(res, members, "Club members retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listDiscussions: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(String(req.query.page ?? "1"), 10) || 1;
      const limit = parseInt(String(req.query.limit ?? "20"), 10) || 20;
      const discussions = await clubsService.listDiscussions(
        getClubId(req),
        getUserId(req),
        page,
        limit
      );
      return sendSuccess(res, discussions, "Club discussions retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  createDiscussion: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const discussion = await clubsService.createDiscussion(
        getClubId(req),
        getUserId(req),
        req.body as CreateDiscussionInput
      );
      return sendSuccess(res, discussion, "Discussion created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  getDiscussion: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { discussionId } = req.params as { discussionId?: string };
      if (!discussionId) throw ErrorFactory.validation("Discussion ID is required.");
      const discussion = await clubsService.getDiscussionById(
        getClubId(req),
        discussionId,
        getUserId(req)
      );
      return sendSuccess(res, discussion, "Discussion retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  updateDiscussion: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { discussionId } = req.params as { discussionId?: string };
      if (!discussionId) throw ErrorFactory.validation("Discussion ID is required.");
      const discussion = await clubsService.updateDiscussion(
        getClubId(req),
        discussionId,
        getUserId(req),
        req.body as UpdateDiscussionInput
      );
      return sendSuccess(res, discussion, "Discussion updated successfully.");
    } catch (err) {
      return next(err);
    }
  },

  deleteDiscussion: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { discussionId } = req.params as { discussionId?: string };
      if (!discussionId) throw ErrorFactory.validation("Discussion ID is required.");
      await clubsService.deleteDiscussion(getClubId(req), discussionId, getUserId(req));
      return sendSuccess(res, null, "Discussion deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listComments: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { discussionId } = req.params as { discussionId?: string };
      if (!discussionId) throw ErrorFactory.validation("Discussion ID is required.");
      const page = parseInt(String(req.query.page ?? "1"), 10) || 1;
      const limit = parseInt(String(req.query.limit ?? "20"), 10) || 20;
      const comments = await clubsService.listComments(
        getClubId(req),
        discussionId,
        getUserId(req),
        page,
        limit
      );
      return sendSuccess(res, comments, "Comments retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  createComment: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { discussionId } = req.params as { discussionId?: string };
      if (!discussionId) throw ErrorFactory.validation("Discussion ID is required.");
      const comment = await clubsService.createComment(
        getClubId(req),
        discussionId,
        getUserId(req),
        req.body as CreateCommentInput
      );
      return sendSuccess(res, comment, "Comment created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  updateComment: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params as { commentId?: string };
      if (!commentId) throw ErrorFactory.validation("Comment ID is required.");
      const comment = await clubsService.updateComment(
        getClubId(req),
        commentId,
        getUserId(req),
        req.body as UpdateCommentInput
      );
      return sendSuccess(res, comment, "Comment updated successfully.");
    } catch (err) {
      return next(err);
    }
  },

  deleteComment: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params as { commentId?: string };
      if (!commentId) throw ErrorFactory.validation("Comment ID is required.");
      await clubsService.deleteComment(getClubId(req), commentId, getUserId(req));
      return sendSuccess(res, null, "Comment deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },

  promoteMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId?: string };
      if (!userId) throw ErrorFactory.validation("User ID is required.");
      const membership = await clubsService.promoteMember(getClubId(req), getUserId(req), userId);
      return sendSuccess(res, membership, "Member promoted to moderator.");
    } catch (err) {
      return next(err);
    }
  },

  demoteMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId?: string };
      if (!userId) throw ErrorFactory.validation("User ID is required.");
      const membership = await clubsService.demoteMember(getClubId(req), getUserId(req), userId);
      return sendSuccess(res, membership, "Member demoted to member.");
    } catch (err) {
      return next(err);
    }
  },

  transferOwnership: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId?: string };
      if (!userId) throw ErrorFactory.validation("User ID is required.");
      const club = await clubsService.transferOwnership(getClubId(req), getUserId(req), userId);
      return sendSuccess(res, club, "Club ownership transferred successfully.");
    } catch (err) {
      return next(err);
    }
  },

  removeMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId?: string };
      if (!userId) throw ErrorFactory.validation("User ID is required.");
      await clubsService.removeMember(getClubId(req), getUserId(req), userId);
      return sendSuccess(res, null, "Member removed successfully.");
    } catch (err) {
      return next(err);
    }
  },

  createEvent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const event = await clubsService.createEvent(
        getClubId(req),
        getUserId(req),
        req.body as CreateEventInput
      );
      return sendSuccess(res, event, "Club event created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  listUpcomingEvents: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const events = await clubsService.listUpcomingEvents(getClubId(req), getUserId(req));
      return sendSuccess(res, events, "Upcoming club events retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
