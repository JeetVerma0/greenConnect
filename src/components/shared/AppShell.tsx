"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FileText,
  Users,
  User,
  Leaf,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Map", icon: Map },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">GreenConnect</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-card hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-card hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold">GreenConnect</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-text-secondary">Welcome back</p>
            <p className="font-medium">{profile?.name ?? "Volunteer"}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-text-secondary">Eco Score</p>
              <p className="font-semibold text-primary">{profile?.ecoScore ?? 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {profile?.name?.charAt(0).toUpperCase() ?? "G"}
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${
                  active ? "bg-primary/10 text-primary" : "text-text-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
