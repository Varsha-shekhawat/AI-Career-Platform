import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "unknown-user";

        const analyses = await prisma.resumeAnalysis.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, analyses });
    } catch (error) {
        console.error("Fetch analyses error:", error);
        return NextResponse.json({ success: true, analyses: [] });
    }
}
