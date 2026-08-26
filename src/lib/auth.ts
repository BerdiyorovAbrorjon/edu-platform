import { type NextAuthOptions } from "next-auth";
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
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("[auth] redirect callback:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      // token.id ni normalize qil (eski sessiyalarda faqat token.sub bor)
      if (!token.id && token.sub) token.id = token.sub;

      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name;
      }

      const userId = (user?.id ?? token.id) as string | undefined;
      if (!userId) return token;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, image: true, role: true },
        });

        if (!dbUser) return token;

        let role = dbUser.role;

        // Yangi foydalanuvchi: STUDENT ni admin/teacher ga upgrade qilish
        if (user && role === "STUDENT") {
          const email = dbUser.email ?? "";
          const adminEmails = getAdminEmails();

          if (adminEmails.length > 0 && adminEmails.includes(email)) {
            await prisma.user.update({ where: { id: dbUser.id }, data: { role: "ADMIN" } });
            role = "ADMIN";
          } else if (adminEmails.length === 0) {
            const userCount = await prisma.user.count();
            if (userCount === 1) {
              await prisma.user.update({ where: { id: dbUser.id }, data: { role: "ADMIN" } });
              role = "ADMIN";
            }
          }

          if (role === "STUDENT") {
            const teacherEntry = await prisma.teacherEmail.findUnique({ where: { email } });
            if (teacherEntry) {
              await prisma.user.update({ where: { id: dbUser.id }, data: { role: "TEACHER" } });
              role = "TEACHER";
            }
          }
        }

        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.role = role;
      } catch (err) {
        console.error("JWT callback DB error:", err);
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
        session.user.name = (token.name as string | null | undefined) ?? null;
        session.user.email = (token.email as string | null | undefined) ?? null;
        session.user.image = (token.picture as string | null | undefined) ?? null;
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
