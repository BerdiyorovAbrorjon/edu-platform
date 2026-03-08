import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role;

    console.log(`[middleware] ${pathname} | role: ${role ?? "none"}`);

    // Root path: redirect authenticated users to their dashboard
    if (pathname === "/") {
      if (token) {
        const dest = role === "ADMIN" || role === "TEACHER" ? "/admin/lessons" : "/student/lessons";
        console.log(`[middleware] / → ${dest}`);
        return NextResponse.redirect(new URL(dest, req.url));
      }
      // Unauthenticated users see the landing page
      return NextResponse.next();
    }

    // Admin routes: require ADMIN or TEACHER role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (role !== "ADMIN" && role !== "TEACHER") {
        console.log(`[middleware] Non-admin/teacher blocked from ${pathname} → /student/lessons`);
        return NextResponse.redirect(new URL("/student/lessons", req.url));
      }
      // Users management: ADMIN only
      if (
        role === "TEACHER" &&
        (pathname.startsWith("/admin/users") || pathname.startsWith("/api/admin/teacher-emails"))
      ) {
        return NextResponse.redirect(new URL("/admin/lessons", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow unauthenticated users to access "/" (landing page);
      // all other matched routes require a valid token.
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/") return true;
        return !!token;
      },
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
