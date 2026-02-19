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
  if (!adminEmailsEnv) return [];
  return adminEmailsEnv.split(",").map((email) => email.trim()).filter(Boolean);
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
    async signIn({ user }) {
      const adminEmails = getAdminEmails();

      if (adminEmails.length === 0) {
        // Fallback: first user to sign in becomes ADMIN
        const userCount = await prisma.user.count();
        if (userCount === 1) {
          await prisma.user.update({
            where: { id: user.id! },
            data: { role: "ADMIN" },
          });
          user.role = "ADMIN";
        }
      } else {
        // Set role based on ADMIN_EMAILS list
        const isAdmin = adminEmails.includes(user.email ?? "");
        await prisma.user.update({
          where: { id: user.id! },
          data: { role: isAdmin ? "ADMIN" : "STUDENT" },
        });
        user.role = isAdmin ? "ADMIN" : "STUDENT";
      }

      return true;
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
