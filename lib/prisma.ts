import { PrismaClient } from "@prisma/client";

// Store the client globally to reuse across requests in dev
const globalForPrisma = globalThis as unknown as {
    __prisma: PrismaClient | undefined;
};

export function db(): PrismaClient {
    if (!globalForPrisma.__prisma) {
        globalForPrisma.__prisma = new PrismaClient();
    }
    return globalForPrisma.__prisma;
}