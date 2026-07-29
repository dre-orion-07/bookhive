import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const usersRepository = {
  findById: (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername: (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  update: (
    id: string,
    data: Partial<{
      displayName: string;
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
};
