"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, BookOpen, LayoutDashboard } from "lucide-react";
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/student/dashboard"
            className="mr-8 flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-base font-bold text-gray-900 sm:inline">
              Edu Platform
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
