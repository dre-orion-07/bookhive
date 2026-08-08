import { PrismaClient } from "@prisma/client";
import { reviewsRepository } from "./reviews.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.schema.js";
import { notificationsService } from "../notifications/notifications.service.js";

const prisma = new PrismaClient();

async function recalculateBookRating(bookId: string) {
  const stats = await reviewsRepository.getBookRatingStats(bookId);
  await prisma.book.update({
    where: { id: bookId },
    data: {
      communityAverageRating: stats.average,
      communityRatingsCount: stats.count,
    },
  });
}

export const reviewsService = {
  create: async (userId: string, input: CreateReviewInput) => {
    const book = await booksRepository.findById(input.bookId);
    if (!book) {
      throw ErrorFactory.bookNotFound();
    }

    const existing = await reviewsRepository.findByUserAndBook(userId, input.bookId);
    if (existing) {
      throw ErrorFactory.validation("You have already reviewed this book.");
    }

    const review = await reviewsRepository.create({
      userId,
      bookId: input.bookId,
      rating: input.rating,
      title: input.title,
      content: input.content,
    });

    await recalculateBookRating(input.bookId);
    await notificationsService.notifyNewReview(userId, input.bookId);

    return review;
  },

  update: async (userId: string, reviewId: string, input: UpdateReviewInput) => {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw ErrorFactory.reviewNotFound();
    }
    if (review.userId !== userId) {
      throw ErrorFactory.accessDenied("You can only edit your own reviews.");
    }

    const updated = await reviewsRepository.update(reviewId, input);

    if (input.rating !== undefined) {
      await recalculateBookRating(review.bookId);
    }

    return updated;
  },

  delete: async (userId: string, reviewId: string) => {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw ErrorFactory.reviewNotFound();
    }
    if (review.userId !== userId) {
      throw ErrorFactory.accessDenied("You can only delete your own reviews.");
    }

    await reviewsRepository.delete(reviewId);
    await recalculateBookRating(review.bookId);
  },

  listForBook: async (bookId: string) => {
    return reviewsRepository.listByBook(bookId);
  },

  listForUser: async (userId: string) => {
    return reviewsRepository.listByUser(userId);
  },

  toggleLike: async (userId: string, reviewId: string) => {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw ErrorFactory.reviewNotFound();
    }

    const alreadyLiked = review.likedBy.includes(userId);
    const updatedLikedBy = alreadyLiked
      ? review.likedBy.filter((id) => id !== userId)
      : [...review.likedBy, userId];

    return reviewsRepository.toggleLike(reviewId, updatedLikedBy);
  },
};
