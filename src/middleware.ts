import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role;

    console.log(`[middleware] ${pathname} | role: ${role ?? "none"}`);

    // Root path → redirect based on role
    if (pathname === "/") {
      const dest = role === "ADMIN" ? "/admin/lessons" : "/student/lessons";
      console.log(`[middleware] / → ${dest}`);
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Admin routes: require ADMIN role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (role !== "ADMIN") {
        console.log(`[middleware] Non-admin blocked from ${pathname} → /student/lessons`);
        return NextResponse.redirect(new URL("/student/lessons", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow request to reach middleware function; unauthenticated requests
      // are automatically redirected to the signIn page by withAuth.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/student/:path*",
    "/api/student/:path*",
    "/api/admin/:path*",
  ],
};
