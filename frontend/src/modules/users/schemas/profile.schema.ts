import { z } from "zod";

export const editProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required.").max(100),
  bio: z.string().max(500, "Bio must be under 500 characters.").optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Please provide a valid URL.").optional().or(z.literal("")),
  favouriteGenres: z.string().optional(),
  readingGoal: z.coerce.number().int().min(1).max(1000).optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
