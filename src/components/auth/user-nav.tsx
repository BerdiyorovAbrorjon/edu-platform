"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Kirish</Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const dashboardHref = isAdmin ? "/admin/analytics" : "/student/dashboard";
  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium leading-none">{session.user.name}</p>
        <p className="text-xs text-muted-foreground">{session.user.email}</p>
      </div>
      <Link href={dashboardHref}>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-1 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Chiqish</span>
      </Button>
    </div>
  );
}
