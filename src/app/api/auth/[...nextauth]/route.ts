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
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
      // On sign in, user object is available; persist role to JWT
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
      // First user to sign in becomes ADMIN automatically
      const userCount = await prisma.user.count();
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id! },
          data: { role: "ADMIN" },
        });
        user.role = "ADMIN";
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
