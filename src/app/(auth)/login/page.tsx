import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { Zap } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/lessons");
    } else {
      redirect("/student/lessons");
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/60">
      {/* Icon + heading */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Xush kelibsiz!
          </h1>
          <p className="mt-1.5 text-gray-500">
            O&apos;qishni boshlash uchun kiring
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">Google hisobi bilan</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Sign in button */}
      <GoogleSignInButton />

      {/* Terms */}
      <p className="mt-5 text-center text-xs leading-relaxed text-gray-400">
        Kirish orqali siz platformaning{" "}
        <span className="text-gray-600">foydalanish shartlarini</span> qabul
        qilasiz
      </p>
    </div>
  );
}
