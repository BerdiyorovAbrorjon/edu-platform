import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Middleware handles redirecting authenticated users from /
// This server component is a fallback for any edge cases.
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "ADMIN") {
    redirect("/admin/lessons");
  }

  if (session) {
    redirect("/student/lessons");
  }

  redirect("/login");
}
