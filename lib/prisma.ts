/* eslint-disable @typescript-eslint/no-explicit-any */

// Lazy Prisma client — only connects when actually used (not at build time).
// Returns null if Prisma Client hasn't been generated yet.

const globalForPrisma = globalThis as unknown as {
    _prisma: any | undefined;
    _prismaChecked: boolean;
};

export function getPrisma(): any | null {
    if (globalForPrisma._prisma) return globalForPrisma._prisma;
    if (globalForPrisma._prismaChecked) return null;

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaClient } = require("@prisma/client");
        globalForPrisma._prisma = new PrismaClient();
        return globalForPrisma._prisma;
    } catch {
        globalForPrisma._prismaChecked = true;
        console.warn(
            "Prisma Client not available. Database features are disabled. " +
            "Run `npx prisma generate` and set DATABASE_URL to enable."
        );
        return null;
    }
}
