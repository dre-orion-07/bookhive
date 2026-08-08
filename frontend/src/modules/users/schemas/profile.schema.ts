import { z } from "zod";

export const editProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required.").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
    .optional(),
  bio: z.string().max(500, "Bio must be under 500 characters.").optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Please provide a valid URL.").optional().or(z.literal("")),
  favouriteGenres: z.string().optional(),
  favouriteAuthors: z.string().optional(),
  readingGoal: z.coerce.number().int().min(1).max(1000).optional(),
  isPrivateProfile: z.boolean().optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const onboardingSchema = z.object({
  favouriteGenres: z.array(z.string()).min(1, "Please select at least one genre."),
  favouriteAuthors: z.string().optional(),
  readingGoal: z.coerce.number().int().min(1).max(1000).optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
