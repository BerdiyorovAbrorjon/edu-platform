import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role;

    // Root path: redirect authenticated users to their dashboard
    if (pathname === "/") {
      if (token) {
        let dest = "/student/lessons";
        if (role === "ADMIN") dest = "/admin/analytics";
        else if (role === "TEACHER") dest = "/teacher/lessons";
        return NextResponse.redirect(new URL(dest, req.url));
      }
      // Unauthenticated users see the landing page
      return NextResponse.next();
    }

    // Role → home page mapping
    const home: Record<string, string> = {
      ADMIN: "/admin/analytics",
      TEACHER: "/teacher/lessons",
      STUDENT: "/student/lessons",
    };
    const roleHome = home[role as string] ?? "/student/lessons";

    // /admin/* — faqat ADMIN
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL(roleHome, req.url));
      }
    }

    // /teacher/* — faqat TEACHER
    if (pathname.startsWith("/teacher")) {
      if (role !== "TEACHER") {
        return NextResponse.redirect(new URL(roleHome, req.url));
      }
    }

    // /student/* va /api/student/* — faqat STUDENT
    if (pathname.startsWith("/student") || pathname.startsWith("/api/student")) {
      if (role !== "STUDENT") {
        return NextResponse.redirect(new URL(roleHome, req.url));
      }
    }

    // /api/admin/* — ADMIN yoki TEACHER (teacher-emails: faqat ADMIN)
    if (pathname.startsWith("/api/admin")) {
      if (role !== "ADMIN" && role !== "TEACHER") {
        return NextResponse.redirect(new URL(roleHome, req.url));
      }
      if (role === "TEACHER" && pathname.startsWith("/api/admin/teacher-emails")) {
        return NextResponse.redirect(new URL(roleHome, req.url));
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
    "/teacher/:path*",
    "/student/:path*",
    "/api/student/:path*",
    "/api/admin/:path*",
  ],
};
