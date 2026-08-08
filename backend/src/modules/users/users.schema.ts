import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
    .optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Please provide a valid URL.").optional().or(z.literal("")),
  favouriteGenres: z.array(z.string()).max(20).optional(),
  favouriteAuthors: z.array(z.string()).max(20).optional(),
  readingGoal: z.number().int().min(1).max(1000).optional(),
  isPrivateProfile: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
