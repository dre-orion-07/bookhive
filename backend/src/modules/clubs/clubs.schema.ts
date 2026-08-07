import { z } from "zod";

export const CLUB_VISIBILITY = ["public", "private", "invite_only"] as const;
export const CLUB_ROLES = ["owner", "moderator", "member"] as const;

export const createClubSchema = z.object({
  name: z.string().min(1, "Club name is required.").max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(CLUB_VISIBILITY).default("public"),
});

export const updateClubSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  visibility: z.enum(CLUB_VISIBILITY).optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required.").max(150),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime("Please provide a valid date/time."),
  endTime: z.string().datetime().optional(),
});

export const createDiscussionSchema = z.object({
  title: z.string().min(1, "Discussion title is required.").max(200),
  content: z.string().min(1, "Content is required.").max(5000),
});

export const updateDiscussionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required.").max(3000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(3000).optional(),
});

export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
export type UpdateDiscussionInput = z.infer<typeof updateDiscussionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
