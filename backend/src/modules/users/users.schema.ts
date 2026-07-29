import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Please provide a valid URL.").optional().or(z.literal("")),
  favouriteGenres: z.array(z.string()).max(20).optional(),
  favouriteAuthors: z.array(z.string()).max(20).optional(),
  readingGoal: z.number().int().min(1).max(1000).optional(),
  isPrivateProfile: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
