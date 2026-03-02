import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

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

        const existingUser = await db().user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = hashPassword(password);
        const user = await db().user.create({
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
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
