/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

const globalForPrisma = globalThis as unknown as {
    __db: any | undefined;
};

export function db(): any {
    if (!globalForPrisma.__db) {
        const { PrismaClient } = require("@prisma/client");
        globalForPrisma.__db = new PrismaClient();
    }
    return globalForPrisma.__db;
}