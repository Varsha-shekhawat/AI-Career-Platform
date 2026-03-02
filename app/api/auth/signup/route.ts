import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createUser as createFileUser } from "@/lib/userStore";

function setAuthCookie(response: NextResponse, email: string) {
    response.cookies.set("auth_session", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function POST(request: Request) {
    try {
        const { email, password, fullName } = await request.json();

        if (!email || !password || !fullName) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        // Try database first
        const prisma = getPrisma();
        if (prisma) {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                });

                if (existingUser) {
                    return NextResponse.json(
                        { success: false, error: "An account with this email already exists." },
                        { status: 409 }
                    );
                }

                const passwordHash = hashPassword(password);
                const user = await prisma.user.create({
                    data: {
                        email: email.toLowerCase(),
                        fullName,
                        passwordHash,
                    },
                });

                const response = NextResponse.json({
                    success: true,
                    user: { email: user.email, fullName: user.fullName },
                });
                setAuthCookie(response, user.email);
                return response;
            } catch (dbError) {
                console.warn("DB signup failed, falling back to file storage:", dbError);
            }
        }

        // Fallback: file-based storage (only works in local dev, not on Vercel)
        try {
            const result = createFileUser(email, fullName, password);
            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.error },
                    { status: 409 }
                );
            }

            const response = NextResponse.json({
                success: true,
                user: result.user,
            });
            setAuthCookie(response, result.user?.email || email);
            return response;
        } catch (fileError) {
            console.warn("File-based signup also failed:", fileError);
        }

        // Neither storage backend worked
        return NextResponse.json(
            { success: false, error: "Database is not configured. Please set DATABASE_URL in your environment variables." },
            { status: 503 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}


