import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "TEACHER" | "STUDENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  }
}
