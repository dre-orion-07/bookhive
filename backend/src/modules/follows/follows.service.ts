import { followsRepository } from "./follows.repository.js";
import { usersRepository } from "../users/users.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

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

    return followsRepository.create(followerId, followingId);
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
};
