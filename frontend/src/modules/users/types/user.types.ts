export interface UserProfile {
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
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  favouriteGenres?: string[];
  favouriteAuthors?: string[];
  readingGoal?: number;
  isPrivateProfile?: boolean;
}
