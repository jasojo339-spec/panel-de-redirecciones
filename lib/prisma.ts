// Cliente de Prisma como singleton.
// En dev Next.js recarga los módulos en cada petición, así que sin esto
// se abren muchas conexiones y Prisma avisa con "PrismaClient is already running".
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
