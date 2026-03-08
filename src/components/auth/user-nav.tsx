"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { data: session } = useSession();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Kirish</Link>
      </Button>
    );
  }

  const role = session.user.role;
  var dashboardHref = "";
  switch (role) {
    case "ADMIN":
      dashboardHref = "/admin/analytics";
      break;
    case "TEACHER":
      dashboardHref = "/teacher/lessons";
      break;
    case "STUDENT":
      dashboardHref = "/student/dashboard";
      break;
  }

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href={dashboardHref} aria-label="Go to dashboard">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="hidden sm:block text-left min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{session.user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLogoutDialog(true)}
          className="gap-1 text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Chiqishni tasdiqlaysizmi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tizimdan chiqasiz va kirish sahifasiga yo&apos;naltirilasiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut({ callbackUrl: "/login" })}>
              Chiqish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
