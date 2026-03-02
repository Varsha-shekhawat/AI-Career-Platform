import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Lazy initialization - don't create client at build time
function getClient(): PrismaClient {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
}

// Export a proxy that lazy-initializes on first use
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        const client = getClient();
        const value = (client as any)[prop];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});