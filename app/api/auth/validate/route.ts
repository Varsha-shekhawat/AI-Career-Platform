import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        // Read the auth_session cookie
        const cookieHeader = request.headers.get("cookie") || "";
        const match = cookieHeader.match(/auth_session=([^;]+)/);
        const email = match ? decodeURIComponent(match[1]) : null;

        if (!email) {
            return NextResponse.json({ valid: false });
        }

        // Check if this user actually exists in the database
        const user = await db().user.findUnique({
            where: { email },
            select: { email: true, fullName: true },
        });

        if (!user) {
            // User doesn't exist — clear the stale cookie
            const response = NextResponse.json({ valid: false });
            response.cookies.set("auth_session", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });
            return response;
        }

        return NextResponse.json({
            valid: true,
            user: { email: user.email, fullName: user.fullName },
        });
    } catch {
        return NextResponse.json({ valid: false });
    }
}
