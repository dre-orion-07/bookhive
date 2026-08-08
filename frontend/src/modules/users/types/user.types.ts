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
  createdAt: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  favouriteGenres?: string[];
  favouriteAuthors?: string[];
  readingGoal?: number;
  isPrivateProfile?: boolean;
}

export interface ReadingStats {
  totalBooks: number;
  booksCompleted: number;
  booksThisYear: number;
  currentlyReading: number;
  wantToRead: number;
  totalPagesRead: number;
  reviewsWritten: number;
  averageRating: number | null;
  followers: number;
  following: number;
}

export interface PublicProfileBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
}

export interface CurrentlyReadingEntry {
  bookId: string;
  percentComplete: number;
  currentPage: number | null;
  book: PublicProfileBook | null;
}

export interface RecentlyFinishedEntry {
  bookId: string;
  finishedAt: string | null;
  book: PublicProfileBook | null;
}

export interface PublicReview {
  id: string;
  bookId: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
}

export interface ShelfSummary {
  id: string;
  name: string;
  icon: string | null;
  bookCount: number;
}

export interface PublicProfile extends UserProfile {
  stats: ReadingStats;
  isFollowing: boolean;
  isOwnProfile: boolean;
  isVisible: boolean;
  shelves: ShelfSummary[];
  currentlyReading: CurrentlyReadingEntry[];
  recentlyFinished: RecentlyFinishedEntry[];
  recentReviews: PublicReview[];
}
