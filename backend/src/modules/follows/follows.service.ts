import { PrismaClient } from "@prisma/client";
import { followsRepository } from "./follows.repository.js";
import { usersRepository } from "../users/users.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import { notificationsService } from "../notifications/notifications.service.js";

const prisma = new PrismaClient();

export const followsService = {
  follow: async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
      throw ErrorFactory.validation("You cannot follow yourself.");
    }

    const targetUser = await usersRepository.findById(followingId);
    if (!targetUser) {
      throw ErrorFactory.userNotFound();
    }

    const existing = await followsRepository.findRelation(followerId, followingId);
    if (existing) {
      throw ErrorFactory.validation("You are already following this user.");
    }

    const relation = await followsRepository.create(followerId, followingId);
    await notificationsService.notifyNewFollower(followerId, followingId);
    return relation;
  },

  unfollow: async (followerId: string, followingId: string) => {
    const existing = await followsRepository.findRelation(followerId, followingId);
    if (!existing) {
      throw ErrorFactory.validation("You are not following this user.");
    }

    return followsRepository.delete(followerId, followingId);
  },

  getFollowers: async (userId: string) => {
    const relations = await followsRepository.listFollowers(userId);
    const users = await Promise.all(relations.map((r) => usersRepository.findById(r.followerId)));
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },

  getFollowing: async (userId: string) => {
    const relations = await followsRepository.listFollowing(userId);
    const users = await Promise.all(relations.map((r) => usersRepository.findById(r.followingId)));
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },

  getFollowCounts: async (userId: string) => {
    const [followers, following] = await Promise.all([
      followsRepository.countFollowers(userId),
      followsRepository.countFollowing(userId),
    ]);
    return { followers, following };
  },

  isFollowing: async (followerId: string, followingId: string) => {
    const relation = await followsRepository.findRelation(followerId, followingId);
    return relation !== null;
  },

  discoverReaders: async (userId: string, limit = 10) => {
    const currentUser = await usersRepository.findById(userId);
    if (!currentUser) {
      return [];
    }

    const alreadyFollowing = await followsRepository.listFollowing(userId);
    const excludeIds = new Set([userId, ...alreadyFollowing.map((f) => f.followingId)]);

    const allUsers = await prisma.user.findMany();

    const candidates = allUsers.filter((u) => !excludeIds.has(u.id) && u.isPrivateProfile !== true);

    const currentGenresLower = currentUser.favouriteGenres.map((g) => g.toLowerCase());
    const currentAuthorsLower = currentUser.favouriteAuthors.map((a) => a.toLowerCase());

    const scored = candidates
      .map((candidate) => {
        const sharedGenres = candidate.favouriteGenres.filter((g) =>
          currentGenresLower.includes(g.toLowerCase())
        );
        const sharedAuthors = candidate.favouriteAuthors.filter((a) =>
          currentAuthorsLower.includes(a.toLowerCase())
        );

        const score = sharedGenres.length * 2 + sharedAuthors.length * 3;

        return {
          id: candidate.id,
          username: candidate.username,
          displayName: candidate.displayName,
          avatar: candidate.avatar,
          bio: candidate.bio,
          sharedGenres,
          sharedAuthors,
          score,
        };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  },
};
