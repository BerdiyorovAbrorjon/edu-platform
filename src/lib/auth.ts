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
  events: {
    async createUser({ user }) {
      const adminEmails = getAdminEmails();
      const userEmail = user.email ?? "";

      console.log("🆕 New user created:", userEmail);

      try {
        if (adminEmails.length > 0) {
          const isAdmin = adminEmails.includes(userEmail);
          if (isAdmin) {
            console.log("✅ Email in ADMIN_EMAILS — setting ADMIN");
            await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
            return;
          }
        } else {
          const userCount = await prisma.user.count();
          if (userCount === 1) {
            console.log("✅ First user — setting ADMIN");
            await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
            return;
          }
        }

        // Check if email is pre-registered as teacher
        const teacherEmail = await prisma.teacherEmail.findUnique({
          where: { email: userEmail },
        });
        if (teacherEmail) {
          console.log("✅ Email in TeacherEmails — setting TEACHER");
          await prisma.user.update({ where: { id: user.id }, data: { role: "TEACHER" } });
        }
      } catch (error) {
        console.error("❌ Error updating user role:", error);
      }
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("[auth] redirect callback:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user, trigger }) {
      if (user || trigger === "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: (user?.id ?? token.id) as string },
          select: { id: true, email: true, role: true },
        });
        if (dbUser) {
          // Upgrade STUDENT → TEACHER if email is in TeacherEmail list
          if (dbUser.role === "STUDENT") {
            const teacherEntry = await prisma.teacherEmail.findUnique({
              where: { email: dbUser.email },
            });
            if (teacherEntry) {
              console.log("⬆️ Upgrading STUDENT to TEACHER:", dbUser.email);
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "TEACHER" },
              });
              token.id = dbUser.id;
              token.role = "TEACHER";
              return token;
            }
          }
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
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
