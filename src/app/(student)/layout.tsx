"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, BookOpen, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/auth/user-nav";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/student/lessons", label: "Darslar", icon: BookOpen },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-2 mr-8">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">Edu Platform</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "gap-2",
                      isActive && "font-medium"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* User area */}
          <div className="ml-auto flex items-center gap-3">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
