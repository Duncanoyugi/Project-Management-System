import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'info', 'warn'] as const,
    });
  }
  return prisma;
};