import { clubsRepository } from "./clubs.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type {
  CreateClubInput,
  CreateEventInput,
  UpdateClubInput,
  CreateDiscussionInput,
  UpdateDiscussionInput,
  CreateCommentInput,
  UpdateCommentInput,
} from "./clubs.schema.js";
import { notificationsService } from "../notifications/notifications.service.js";

const MANAGER_ROLES = new Set(["owner", "moderator"]);
const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function requireClubId(clubId: string) {
  if (!MONGO_OBJECT_ID_PATTERN.test(clubId)) {
    throw ErrorFactory.clubNotFound();
  }
}

async function getExistingClub(clubId: string) {
  requireClubId(clubId);

  const club = await clubsRepository.findById(clubId);
  if (!club) {
    throw ErrorFactory.clubNotFound();
  }

  return club;
}

async function requireMembership(clubId: string, userId: string) {
  const membership = await clubsRepository.findMembership(clubId, userId);
  if (!membership) {
    throw ErrorFactory.accessDenied("You must be a club member to perform this action.");
  }

  return membership;
}

async function requireManagerRole(clubId: string, userId: string) {
  const membership = await requireMembership(clubId, userId);
  if (!MANAGER_ROLES.has(membership.role)) {
    throw ErrorFactory.accessDenied("Only club owners and moderators can perform this action.");
  }

  return membership;
}

export const clubsService = {
  create: async (ownerId: string, input: CreateClubInput) => {
    const club = await clubsRepository.create(ownerId, input);
    await clubsRepository.addMember(club.id, ownerId, "owner");
    return club;
  },

  getById: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    const memberCount = await clubsRepository.countMembers(clubId);
    return { ...club, memberCount };
  },

  update: async (clubId: string, userId: string, input: UpdateClubInput) => {
    const club = await getExistingClub(clubId);

    if (club.ownerId !== userId) {
      throw ErrorFactory.accessDenied("Only the club owner can update this club.");
    }

    return clubsRepository.update(clubId, input);
  },

  delete: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.ownerId !== userId) {
      throw ErrorFactory.accessDenied("Only the club owner can delete this club.");
    }

    return clubsRepository.delete(clubId);
  },

  listPublic: async () => {
    return clubsRepository.listPublic();
  },

  join: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.visibility !== "public") {
      throw ErrorFactory.accessDenied("This club requires an invitation to join.");
    }

    const existing = await clubsRepository.findMembership(clubId, userId);
    if (existing) {
      throw ErrorFactory.validation("You are already a member of this club.");
    }

    const membership = await clubsRepository.addMember(clubId, userId, "member");
    await notificationsService.notifyClubJoin(clubId, userId);
    return membership;
  },

  leave: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.ownerId === userId) {
      throw ErrorFactory.validation(
        "Club owners must delete the club or transfer ownership before leaving."
      );
    }

    const existing = await clubsRepository.findMembership(clubId, userId);
    if (!existing) {
      throw ErrorFactory.validation("You are not a member of this club.");
    }

    return clubsRepository.removeMember(clubId, userId);
  },

  listMembers: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    return clubsRepository.listMembers(clubId);
  },

  createEvent: async (clubId: string, userId: string, input: CreateEventInput) => {
    await getExistingClub(clubId);
    await requireManagerRole(clubId, userId);

    const startTime = new Date(input.startTime);
    const endTime = input.endTime ? new Date(input.endTime) : undefined;

    if (endTime && endTime <= startTime) {
      throw ErrorFactory.validation("Event end time must be after the start time.");
    }

    const event = await clubsRepository.createEvent(clubId, {
      title: input.title,
      description: input.description,
      startTime,
      endTime,
    });

    await notificationsService.notifyClubEvent(clubId, userId, input.title);

    return event;
  },

  listUpcomingEvents: async (clubId: string, userId: string) => {
    const club = await getExistingClub(clubId);

    if (club.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    return clubsRepository.listUpcomingEvents(clubId);
  },

  /* Discussions */
  listDiscussions: async (clubId: string, userId: string, page = 1, limit = 20) => {
    const club = await getExistingClub(clubId);
    if (club.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    return clubsRepository.findDiscussions(clubId, page, limit);
  },

  getDiscussionById: async (clubId: string, discussionId: string, userId: string) => {
    const club = await getExistingClub(clubId);
    if (club.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    const discussion = await clubsRepository.findDiscussionById(discussionId);
    if (!discussion || discussion.clubId !== clubId) {
      throw ErrorFactory.validation("Discussion not found.");
    }

    return discussion;
  },

  createDiscussion: async (clubId: string, userId: string, input: CreateDiscussionInput) => {
    await getExistingClub(clubId);
    await requireMembership(clubId, userId);

    const discussion = await clubsRepository.createDiscussion(clubId, {
      authorId: userId,
      title: input.title,
      content: input.content,
    });

    await notificationsService.notifyClubDiscussion(clubId, userId, input.title);

    return discussion;
  },

  updateDiscussion: async (
    clubId: string,
    discussionId: string,
    userId: string,
    input: UpdateDiscussionInput
  ) => {
    await getExistingClub(clubId);

    const discussion = await clubsRepository.findDiscussionById(discussionId);
    if (!discussion || discussion.clubId !== clubId) {
      throw ErrorFactory.validation("Discussion not found.");
    }

    if (discussion.authorId !== userId) {
      await requireManagerRole(clubId, userId);
    }

    return clubsRepository.updateDiscussion(discussionId, input);
  },

  deleteDiscussion: async (clubId: string, discussionId: string, userId: string) => {
    await getExistingClub(clubId);

    const discussion = await clubsRepository.findDiscussionById(discussionId);
    if (!discussion || discussion.clubId !== clubId) {
      throw ErrorFactory.validation("Discussion not found.");
    }

    if (discussion.authorId !== userId) {
      await requireManagerRole(clubId, userId);
    }

    return clubsRepository.deleteDiscussion(discussionId);
  },

  /* Comments */
  listComments: async (
    clubId: string,
    discussionId: string,
    userId: string,
    page = 1,
    limit = 20
  ) => {
    await getExistingClub(clubId);
    const discussion = await clubsRepository.findDiscussionById(discussionId);
    if (!discussion || discussion.clubId !== clubId) {
      throw ErrorFactory.validation("Discussion not found.");
    }

    if (discussion.clubId && (await clubsRepository.findById(clubId))?.visibility !== "public") {
      await requireMembership(clubId, userId);
    }

    return clubsRepository.listComments(discussionId, page, limit);
  },

  createComment: async (
    clubId: string,
    discussionId: string,
    userId: string,
    input: CreateCommentInput
  ) => {
    await getExistingClub(clubId);
    const discussion = await clubsRepository.findDiscussionById(discussionId);
    if (!discussion || discussion.clubId !== clubId) {
      throw ErrorFactory.validation("Discussion not found.");
    }

    await requireMembership(clubId, userId);

    const comment = await clubsRepository.createComment(discussionId, {
      authorId: userId,
      content: input.content,
    });

    await notificationsService.notifyDiscussionReply(clubId, discussionId, userId, input.content);

    return comment;
  },

  updateComment: async (
    clubId: string,
    commentId: string,
    userId: string,
    input: UpdateCommentInput
  ) => {
    await getExistingClub(clubId);
    const found = await clubsRepository.findCommentById(commentId);

    if (!found) {
      throw ErrorFactory.validation("Comment not found.");
    }

    if (found.authorId !== userId) {
      await requireManagerRole(clubId, userId);
    }

    return clubsRepository.updateComment(commentId, input);
  },

  deleteComment: async (clubId: string, commentId: string, userId: string) => {
    await getExistingClub(clubId);

    // find comment
    const found = await clubsRepository.findCommentById(commentId);
    if (!found) {
      throw ErrorFactory.validation("Comment not found.");
    }

    if (found.authorId !== userId) {
      await requireManagerRole(clubId, userId);
    }

    return clubsRepository.deleteComment(commentId);
  },

  /* Member management */
  promoteMember: async (clubId: string, managerUserId: string, targetUserId: string) => {
    await getExistingClub(clubId);
    await requireManagerRole(clubId, managerUserId);

    const membership = await clubsRepository.findMembership(clubId, targetUserId);
    if (!membership) throw ErrorFactory.validation("Member not found.");
    if (membership.role === "owner") throw ErrorFactory.validation("Cannot change owner role.");

    return clubsRepository.updateMemberRole(clubId, targetUserId, "moderator");
  },

  demoteMember: async (clubId: string, managerUserId: string, targetUserId: string) => {
    await getExistingClub(clubId);
    await requireManagerRole(clubId, managerUserId);

    const membership = await clubsRepository.findMembership(clubId, targetUserId);
    if (!membership) throw ErrorFactory.validation("Member not found.");

    if (membership.role === "owner") throw ErrorFactory.validation("Cannot change owner role.");

    return clubsRepository.updateMemberRole(clubId, targetUserId, "member");
  },

  transferOwnership: async (clubId: string, currentOwnerId: string, newOwnerId: string) => {
    const club = await getExistingClub(clubId);
    if (club.ownerId !== currentOwnerId) {
      throw ErrorFactory.accessDenied("Only the current owner can transfer ownership.");
    }

    const membership = await clubsRepository.findMembership(clubId, newOwnerId);
    if (!membership) throw ErrorFactory.validation("New owner must be a member of the club.");

    // set new owner and update roles
    await clubsRepository.setOwner(clubId, newOwnerId);
    await clubsRepository.updateMemberRole(clubId, newOwnerId, "owner");
    // demote previous owner to moderator
    const prevMembership = await clubsRepository.findMembership(clubId, currentOwnerId);
    if (prevMembership) {
      await clubsRepository.updateMemberRole(clubId, currentOwnerId, "moderator");
    }

    return clubsRepository.findById(clubId);
  },

  removeMember: async (clubId: string, managerUserId: string, targetUserId: string) => {
    await getExistingClub(clubId);
    await requireManagerRole(clubId, managerUserId);

    const membership = await clubsRepository.findMembership(clubId, targetUserId);
    if (!membership) throw ErrorFactory.validation("Member not found.");
    if (membership.role === "owner") throw ErrorFactory.validation("Cannot remove the club owner.");

    return clubsRepository.removeMember(clubId, targetUserId);
  },
};
