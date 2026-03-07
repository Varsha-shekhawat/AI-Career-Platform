import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
    const hasDbUrl = !!process.env.DATABASE_URL;

    let dbConnected = false;
    let dbError = null;

    try {
        // Test SQLite connectivity with a simple query
        await db().$queryRaw`SELECT 1`;
        dbConnected = true;
    } catch (e: unknown) {
        dbError = e instanceof Error ? e.message : "Connection test failed";
    }

    return NextResponse.json({
        status: "ok",
        database: {
            DATABASE_URL_SET: hasDbUrl,
            DB_TYPE: "sqlite",
            DB_CONNECTED: dbConnected,
            DB_CONNECTION_ERROR: dbError,
        },
        environment: process.env.NODE_ENV,
    });
}
