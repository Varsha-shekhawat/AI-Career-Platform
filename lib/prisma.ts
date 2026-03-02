/* eslint-disable @typescript-eslint/no-explicit-any */

// Lazy Prisma client — only connects when actually used (not at build time).
// Returns null if Prisma Client hasn't been generated yet or DATABASE_URL is missing.

const globalForPrisma = globalThis as unknown as {
    _prisma: any | undefined;
    _prismaChecked: boolean;
    _prismaError: string | undefined;
};

export function getPrisma(): any | null {
    if (globalForPrisma._prisma) return globalForPrisma._prisma;
    if (globalForPrisma._prismaChecked) return null;

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        globalForPrisma._prismaChecked = true;
        globalForPrisma._prismaError = "DATABASE_URL environment variable is not set";
        console.warn("Prisma: DATABASE_URL is not set. Database features disabled.");
        return null;
    }

    // Check if DATABASE_URL is still a placeholder
    if (process.env.DATABASE_URL.includes("username:password") ||
        process.env.DATABASE_URL.includes("<password>") ||
        process.env.DATABASE_URL.includes("<username>")) {
        globalForPrisma._prismaChecked = true;
        globalForPrisma._prismaError = "DATABASE_URL contains placeholder credentials";
        console.warn("Prisma: DATABASE_URL contains placeholder credentials. Please update with real MongoDB credentials.");
        return null;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaClient } = require("@prisma/client");
        globalForPrisma._prisma = new PrismaClient();
        console.log("Prisma: Client initialized successfully");
        return globalForPrisma._prisma;
    } catch (error: any) {
        globalForPrisma._prismaChecked = true;
        globalForPrisma._prismaError = error?.message || "Unknown error";
        console.warn(
            "Prisma Client not available:", error?.message || error,
            "\nRun `npx prisma generate` and ensure DATABASE_URL is set correctly."
        );
        return null;
    }
}

export function getPrismaError(): string | undefined {
    return globalForPrisma._prismaError;
}
