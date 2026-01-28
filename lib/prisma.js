import { PrismaClient } from '@prisma/client';

// Prevent creating multiple instances in dev (Next.js hot reload)
const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

prisma = globalForPrisma.prisma;

export default prisma;

