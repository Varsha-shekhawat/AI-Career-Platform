import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authCookie = request.cookies.get("auth_session")?.value;

    // If not authenticated and trying to access protected routes → redirect to /login
    if (!authCookie && pathname !== "/login") {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated and trying to access /login → redirect to dashboard
    if (authCookie && pathname === "/login") {
        const dashboardUrl = new URL("/", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - /api (API routes)
         * - /_next (Next.js internals)
         * - /favicon.ico, /sitemap.xml, /robots.txt (static meta files)
         * - Static files (images, fonts, etc.)
         */
        "/((?!api|_next|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.).*)",
    ],
};
