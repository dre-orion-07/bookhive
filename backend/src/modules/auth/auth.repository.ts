import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  findByUsername: (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  findById: (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  create: (data: {
    email: string;
    passwordHash: string;
    username: string;
    displayName: string;
  }) => {
    return prisma.user.create({ data });
  },
  findByGoogleId: (googleId: string) => {
    return prisma.user.findFirst({ where: { googleId } });
  },

  createFromGoogle: (data: {
    email: string;
    googleId: string;
    username: string;
    displayName: string;
    avatar?: string;
  }) => {
    return prisma.user.create({ data });
  },
};
