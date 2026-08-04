import { z } from "zod";

export const createReviewSchema = z.object({
  bookId: z.string().min(1, "Book ID is required."),
  rating: z.number().int().min(1, "Rating must be between 1 and 5.").max(5),
  title: z.string().max(150).optional(),
  content: z.string().min(1, "Review content is required.").max(5000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(150).optional(),
  content: z.string().min(1).max(5000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
