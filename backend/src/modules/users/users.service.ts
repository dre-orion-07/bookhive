import { usersRepository } from "./users.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { UpdateProfileInput } from "./users.schema.js";
import { storageProvider } from "../../providers/storage/cloudinary.provider.js";
import { PrismaClient } from "@prisma/client";
import { booksRepository } from "../books/books.repository.js";

const prisma = new PrismaClient();

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
  createdAt: Date;
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
    createdAt: user.createdAt,
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
    if (input.username) {
      const taken = await usersRepository.isUsernameTaken(input.username, id);
      if (taken) {
        throw ErrorFactory.usernameAlreadyExists();
      }
    }
    const user = await usersRepository.update(id, input);
    return toPublicUser(user);
  },

  getStats: async (userId: string) => {
    return usersRepository.getReadingStats(userId);
  },

  getPublicProfile: async (username: string, viewerUserId?: string) => {
    const user = await usersRepository.findByUsername(username);
    if (!user) {
      throw ErrorFactory.userNotFound();
    }

    const stats = await usersRepository.getReadingStats(user.id);

    // Check if viewer follows this user
    let isFollowing = false;
    if (viewerUserId && viewerUserId !== user.id) {
      const relation = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerUserId, followingId: user.id } },
      });
      isFollowing = relation !== null;
    }

    const isOwnProfile = viewerUserId === user.id;
    const isVisible = !user.isPrivateProfile || isOwnProfile || isFollowing;

    // Bookshelves — always show shelf names, only show contents if visible
    const shelves = await prisma.bookshelf.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    // Currently reading (up to 4 books)
    let currentlyReading: {
      bookId: string;
      percentComplete: number;
      currentPage: number | null;
      book: { id: string; title: string; authors: string[]; thumbnail: string | null } | null;
    }[] = [];
    let recentlyFinished: {
      bookId: string;
      finishedAt: Date | null;
      book: { id: string; title: string; authors: string[]; thumbnail: string | null } | null;
    }[] = [];
    let recentReviews: {
      id: string;
      bookId: string;
      rating: number;
      title: string | null;
      content: string;
      createdAt: Date;
    }[] = [];

    if (isVisible) {
      const [currentProgress, finishedProgress, reviews] = await Promise.all([
        prisma.readingProgress.findMany({
          where: { userId: user.id, status: "currently_reading" },
          take: 4,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.readingProgress.findMany({
          where: { userId: user.id, status: "completed" },
          take: 6,
          orderBy: { finishedAt: "desc" },
        }),
        prisma.review.findMany({
          where: { userId: user.id },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            bookId: true,
            rating: true,
            title: true,
            content: true,
            createdAt: true,
          },
        }),
      ]);

      currentlyReading = await Promise.all(
        currentProgress.map(async (p) => ({
          bookId: p.bookId,
          percentComplete: p.percentComplete,
          currentPage: p.currentPage,
          book: await booksRepository
            .findById(p.bookId)
            .then((b) =>
              b ? { id: b.id, title: b.title, authors: b.authors, thumbnail: b.thumbnail } : null
            ),
        }))
      );

      recentlyFinished = await Promise.all(
        finishedProgress.map(async (p) => ({
          bookId: p.bookId,
          finishedAt: p.finishedAt,
          book: await booksRepository
            .findById(p.bookId)
            .then((b) =>
              b ? { id: b.id, title: b.title, authors: b.authors, thumbnail: b.thumbnail } : null
            ),
        }))
      );

      recentReviews = reviews;
    }

    return {
      id: user.id,
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
      createdAt: user.createdAt,
      stats,
      isFollowing,
      isOwnProfile,
      isVisible,
      shelves: shelves.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        bookCount: s.bookIds.length,
      })),
      currentlyReading: isVisible ? currentlyReading : [],
      recentlyFinished: isVisible ? recentlyFinished : [],
      recentReviews: isVisible ? recentReviews : [],
    };
  },
};
