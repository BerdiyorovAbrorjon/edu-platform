"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield } from "lucide-react";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

const roleLabel: Record<ProfileData["role"], string> = {
  ADMIN: "Admin",
  TEACHER: "O'qituvchi",
  STUDENT: "Talaba",
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (res.ok) setProfile(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card className="rounded-2xl">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Profil ma&apos;lumotlarini yuklab bo&apos;lmadi</p>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">
          Avatar, email va role faqat ko&apos;rsatish uchun mavjud
        </p>
      </div>

      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Foydalanuvchi ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 border border-white/20 bg-slate-200 shadow-md ring-2 ring-white/80">
              <AvatarImage
                src={profile.image ?? undefined}
                alt={profile.name ?? "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-semibold text-white">
                {initials || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {profile.name ?? "Name kiritilmagan"}
              </p>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                {roleLabel[profile.role]}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input value={profile.name ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                Email
              </label>
              <Input value={profile.email} disabled />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Shield className="h-4 w-4 text-gray-400" />
                Role
              </label>
              <Input value={roleLabel[profile.role]} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
