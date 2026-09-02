import { PrismaClient } from '@prisma/client';

/**
 * מופע Prisma יחיד. ב-dev, HMR טוען מודולים מחדש ובלי המטמון הזה
 * ייפתחו עשרות חיבורים למסד עד שהוא יסרב.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
