import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const usersRepository = {
  findById: (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername: (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  findByEmail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  isUsernameTaken: async (username: string, excludeUserId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { username } });
    return user !== null && user.id !== excludeUserId;
  },

  update: (
    id: string,
    data: Partial<{
      displayName: string;
      username: string;
      bio: string;
      location: string;
      website: string;
      favouriteGenres: string[];
      favouriteAuthors: string[];
      readingGoal: number;
      isPrivateProfile: boolean;
      avatar: string;
    }>
  ) => {
    return prisma.user.update({ where: { id }, data });
  },

  getReadingStats: async (userId: string) => {
    const [allProgress, reviews, followers, following] = await Promise.all([
      prisma.readingProgress.findMany({ where: { userId } }),
      prisma.review.findMany({ where: { userId }, select: { rating: true, createdAt: true } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    const completed = allProgress.filter((p) => p.status === "completed");
    const currentlyReading = allProgress.filter((p) => p.status === "currently_reading");
    const wantToRead = allProgress.filter((p) => p.status === "want_to_read");

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const booksThisYear = completed.filter(
      (p) => p.finishedAt !== null && p.finishedAt >= startOfYear
    ).length;

    const totalPages = allProgress.reduce((acc, p) => {
      if (p.status === "completed" && p.currentPage) {
        return acc + p.currentPage;
      }
      return acc;
    }, 0);

    const averageRating =
      reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null;

    return {
      totalBooks: allProgress.length,
      booksCompleted: completed.length,
      booksThisYear,
      currentlyReading: currentlyReading.length,
      wantToRead: wantToRead.length,
      totalPagesRead: totalPages,
      reviewsWritten: reviews.length,
      averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
      followers,
      following,
    };
  },
};
