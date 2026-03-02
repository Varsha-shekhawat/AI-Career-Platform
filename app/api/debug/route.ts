import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + "..."
        : "NOT SET";

    let dbConnected = false;
    let dbError = null;

    try {
        await prisma.$runCommandRaw({ ping: 1 });
        dbConnected = true;
    } catch (e: unknown) {
        dbError = e instanceof Error ? e.message : "Connection test failed";
    }

    return NextResponse.json({
        status: "ok",
        database: {
            DATABASE_URL_SET: hasDbUrl,
            DATABASE_URL_PREFIX: dbUrlPrefix,
            PRISMA_CLIENT_LOADED: true,
            DB_CONNECTED: dbConnected,
            DB_CONNECTION_ERROR: dbError,
        },
        environment: process.env.NODE_ENV,
    });
}
