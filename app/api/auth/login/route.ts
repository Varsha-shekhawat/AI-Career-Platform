import { NextResponse } from "next/server";
import { getPrisma, getPrismaError } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { authenticateUser as authenticateFileUser } from "@/lib/userStore";

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
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required." },
                { status: 400 }
            );
        }

        // Try database first
        const prisma = getPrisma();
        if (prisma) {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                });

                if (user) {
                    const isValid = verifyPassword(password, user.passwordHash);
                    if (!isValid) {
                        return NextResponse.json(
                            { success: false, error: "Incorrect password. Please try again." },
                            { status: 401 }
                        );
                    }

                    const response = NextResponse.json({
                        success: true,
                        user: { email: user.email, fullName: user.fullName },
                    });
                    setAuthCookie(response, user.email);
                    return response;
                }

                // User not found in database
                return NextResponse.json(
                    { success: false, error: "No account found with this email. Please sign up first." },
                    { status: 401 }
                );
            } catch (dbError) {
                console.warn("DB login failed, falling back to file storage:", dbError);
            }
        }

        // Fallback: file-based storage (only works in local dev, not on Vercel)
        try {
            const result = authenticateFileUser(email, password);
            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.error },
                    { status: 401 }
                );
            }

            const response = NextResponse.json({
                success: true,
                user: result.user,
            });
            setAuthCookie(response, result.user?.email || email);
            return response;
        } catch (fileError) {
            console.warn("File-based login also failed:", fileError);
        }

        // Neither storage backend worked
        const prismaError = getPrismaError();
        return NextResponse.json(
            { success: false, error: `Database is not configured. ${prismaError || "Please set DATABASE_URL in your environment variables."}` },
            { status: 503 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

