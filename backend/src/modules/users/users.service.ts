import { usersRepository } from "./users.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { UpdateProfileInput } from "./users.schema.js";
import { storageProvider } from "../../providers/storage/cloudinary.provider.js";

function toPublicUser(user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  location: string | null;
  website: string | null;
  favouriteGenres: string[];
  favouriteAuthors: string[];
  readingGoal: number | null;
  isPrivateProfile: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatar: user.avatar,
    location: user.location,
    website: user.website,
    favouriteGenres: user.favouriteGenres,
    favouriteAuthors: user.favouriteAuthors,
    readingGoal: user.readingGoal,
    isPrivateProfile: user.isPrivateProfile,
  };
}

export const usersService = {
  getById: async (id: string) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw ErrorFactory.userNotFound();
    }
    return toPublicUser(user);
  },

  uploadAvatar: async (id: string, fileBuffer: Buffer) => {
    const avatarUrl = await storageProvider.uploadImage(fileBuffer, "avatars");
    const user = await usersRepository.update(id, { avatar: avatarUrl });
    return toPublicUser(user);
  },

  getByUsername: async (username: string) => {
    const user = await usersRepository.findByUsername(username);
    if (!user) {
      throw ErrorFactory.userNotFound();
    }
    return toPublicUser(user);
  },

  updateProfile: async (id: string, input: UpdateProfileInput) => {
    const user = await usersRepository.update(id, input);
    return toPublicUser(user);
  },
};
