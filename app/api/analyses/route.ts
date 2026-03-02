import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAnalysesByUser } from "@/lib/analysisStore";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || "unknown-user";

        // Try database first
        const prisma = getPrisma();
        if (prisma) {
            try {
                const analyses = await prisma.resumeAnalysis.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                });

                if (analyses.length > 0) {
                    return NextResponse.json({ success: true, analyses });
                }
                // If DB returned empty, also check file store (user may have data there)
            } catch (dbError) {
                console.warn("DB fetch failed, using file storage:", dbError);
            }
        }

        // Fallback: file-based storage
        const fileAnalyses = getAnalysesByUser(userId);
        return NextResponse.json({ success: true, analyses: fileAnalyses });
    } catch (error) {
        console.error("Fetch analyses error:", error);
        return NextResponse.json({ success: true, analyses: [] });
    }
}
