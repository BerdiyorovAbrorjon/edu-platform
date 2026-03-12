"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function UserNav() {
  const { data: session, update } = useSession();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, ready: false });

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 112;
    const dropdownWidth = dropdownRef.current?.offsetWidth ?? 224;
    const gap = 8;
    const viewportPadding = 12;

    let left = triggerRect.left;
    if (left + dropdownWidth > window.innerWidth - viewportPadding) {
      left = triggerRect.right - dropdownWidth;
    }
    left = Math.max(viewportPadding, left);

    const shouldOpenUp =
      triggerRect.bottom + gap + dropdownHeight > window.innerHeight - viewportPadding &&
      triggerRect.top - gap - dropdownHeight >= viewportPadding;

    let top = shouldOpenUp
      ? triggerRect.top - dropdownHeight - gap
      : triggerRect.bottom + gap;

    top = Math.max(
      viewportPadding,
      Math.min(top, window.innerHeight - dropdownHeight - viewportPadding)
    );

    setMenuPosition({ top, left, ready: true });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showMenu) {
      setMenuPosition((prev) => ({ ...prev, ready: false }));
      return;
    }

    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [showMenu, updateMenuPosition]);

  if (!session?.user) {
    return null;
  }

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleOpenProfileDialog = () => {
    setName(session.user.name ?? "");
    setShowMenu(false);
    setShowProfileDialog(true);
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      toast.error("Name 2 dan 80 belgigacha bo'lishi kerak");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Name ni saqlashda xatolik");
      }

      await update({ name: data.name });
      toast.success("Name yangilandi");
      setShowProfileDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Name ni saqlashda xatolik"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Open profile menu"
            className="rounded-full"
            ref={triggerRef}
          >
            <Avatar className="h-9 w-9 cursor-pointer bg-slate-200 shadow-md ">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold text-white">
                {initials || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </button>

          {showMenu && (
            <div
              ref={dropdownRef}
              className="fixed z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                visibility: menuPosition.ready ? "visible" : "hidden",
              }}
            >
              <div className="rounded-lg px-3 py-2 text-sm text-gray-500">
                <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                <p className="mt-1 truncate font-medium text-gray-800">
                  {session.user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenProfileDialog}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <User className="h-4 w-4 text-gray-400" />
                Profile
              </button>
            </div>
          )}
        </div>
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

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingizni kiriting"
              maxLength={80}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
              disabled={saving}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleSaveName} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
