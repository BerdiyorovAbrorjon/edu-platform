import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Edu Platform</CardTitle>
        <CardDescription className="text-base">
          O&apos;qishni boshlash uchun kiring
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GoogleSignInButton />
        <p className="text-center text-xs text-muted-foreground">
          Kirish orqali siz platformaning foydalanish shartlarini qabul qilasiz
        </p>
      </CardContent>
    </Card>
  );
}
