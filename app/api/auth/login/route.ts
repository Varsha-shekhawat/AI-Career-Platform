import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

function setAuthCookie(response: NextResponse, email: string) {
    response.cookies.set("auth_session", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
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

        const user = await db().user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "No account found with this email. Please sign up first." },
                { status: 401 }
            );
        }

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
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}