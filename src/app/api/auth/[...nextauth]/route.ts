/*
 * Google OAuth Setup:
 * 1. Go to https://console.cloud.google.com
 * 2. Create new project or select existing
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 Client ID (Web application)
 * 5. Add authorized redirect URIs:
 *    - http://localhost:3000/api/auth/callback/google
 *    - https://yourdomain.com/api/auth/callback/google (production)
 * 6. Copy Client ID and Client Secret
 * 7. Add to .env.local:
 *    GOOGLE_CLIENT_ID=your-client-id
 *    GOOGLE_CLIENT_SECRET=your-client-secret
 *    NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
 *    NEXTAUTH_URL=http://localhost:3000
 *
 * ADMIN_EMAILS Configuration:
 * - Add admin emails to .env.local
 * - Format: ADMIN_EMAILS=email1@domain.com,email2@domain.com
 * - No spaces between emails
 * - If not set, first user becomes admin automatically (fallback)
 * - Existing users must logout and login again after being added to the list
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    console.log("⚠️ ADMIN_EMAILS not set - first user will be admin");
    return [];
  }
  const emails = adminEmailsEnv.split(",").map((e) => e.trim()).filter(Boolean);
  console.log("📧 Admin emails configured:", emails);
  return emails;
};

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  events: {
    // Fires AFTER PrismaAdapter creates the user — safe to update role here.
    async createUser({ user }) {
      const adminEmails = getAdminEmails();
      const userEmail = user.email ?? "";

      console.log("🆕 New user created:", userEmail);

      try {
        if (adminEmails.length > 0) {
          const isAdmin = adminEmails.includes(userEmail);
          console.log(isAdmin ? "✅ Email in ADMIN_EMAILS — setting ADMIN" : "ℹ️ Not in admin list — keeping STUDENT");
          if (isAdmin) {
            await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
          }
        } else {
          // Fallback: first user becomes ADMIN
          const userCount = await prisma.user.count();
          console.log("📊 Total users:", userCount);
          if (userCount === 1) {
            console.log("✅ First user — setting ADMIN");
            await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
          }
        }
      } catch (error) {
        console.error("❌ Error updating user role:", error);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in, re-fetch role from DB so it's always up to date.
      if (user || trigger === "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: (user?.id ?? token.id) as string },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STUDENT";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
