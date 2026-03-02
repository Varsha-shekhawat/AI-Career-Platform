import { NextResponse } from "next/server";
import { getPrisma, getPrismaError } from "@/lib/prisma";

export async function GET() {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + "..."
        : "NOT SET";

    const prisma = getPrisma();
    const prismaError = getPrismaError();

    let dbConnected = false;
    let dbError = null;

    if (prisma) {
        try {
            // Try a simple query to test the connection
            await prisma.$runCommandRaw({ ping: 1 });
            dbConnected = true;
        } catch (e: any) {
            dbError = e?.message || "Connection test failed";
        }
    }

    return NextResponse.json({
        status: "ok",
        database: {
            DATABASE_URL_SET: hasDbUrl,
            DATABASE_URL_PREFIX: dbUrlPrefix,
            PRISMA_CLIENT_LOADED: !!prisma,
            PRISMA_ERROR: prismaError || null,
            DB_CONNECTED: dbConnected,
            DB_CONNECTION_ERROR: dbError,
        },
        environment: process.env.NODE_ENV,
    });
}
