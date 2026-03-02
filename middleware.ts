import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authCookie = request.cookies.get("auth_session")?.value;

    // Protect app routes: if no cookie and NOT on /login, redirect to /login
    if (!authCookie && pathname !== "/login") {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl, 307);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.).*)",
    ],
};
