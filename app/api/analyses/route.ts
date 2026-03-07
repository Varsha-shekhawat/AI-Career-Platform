import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "unknown-user";

        const rawAnalyses = await db().resumeAnalysis.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        // Parse JSON-encoded array fields back to arrays
        const analyses = rawAnalyses.map((a: Record<string, unknown>) => ({
            ...a,
            strengths: JSON.parse((a.strengths as string) || "[]"),
            weaknesses: JSON.parse((a.weaknesses as string) || "[]"),
            recommendations: JSON.parse((a.recommendations as string) || "[]"),
        }));

        return NextResponse.json({ success: true, analyses });
    } catch (error) {
        console.error("Fetch analyses error:", error);
        return NextResponse.json({ success: true, analyses: [] });
    }
}
