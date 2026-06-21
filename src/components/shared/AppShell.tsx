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
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Map", icon: Map },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/audit-verification", label: "Audit Verification", icon: ShieldCheck },
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
    <div className="relative flex min-h-screen bg-background text-text-primary overflow-hidden">
      {/* 2026 Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/2 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/1.5 blur-[120px] pointer-events-none -z-10" />

      {/* Sidebar Navigation: Floating Glass Panel */}
      <aside className="hidden w-64 flex-col bg-[var(--sidebar-bg)] m-4 mr-0 rounded-2xl shadow-xl border border-border lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-black shadow-sm">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">GreenConnect</span>
        </div>
        
        <nav className="flex flex-1 flex-col gap-1.5 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 ${
                  active
                    ? "bg-[var(--sidebar-item-active)] text-[var(--active-filter-text)] border-[var(--active-filter-border)] dark:text-primary dark:border-primary shadow-[inset_0_1px_6px_rgba(16,185,129,0.08)] font-semibold"
                    : "text-text-secondary border-transparent hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] hover:bg-[var(--sidebar-item-hover)] hover:text-text-primary"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors duration-200 ${active ? "text-primary" : "text-text-secondary/70"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary border border-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>
      </aside>
 
      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
        {/* Header Section: Floating Glass Panel */}
        <header className="flex items-center justify-between bg-[var(--header-bg)] backdrop-blur-md px-6 py-4 m-4 mb-0 rounded-2xl shadow-md border border-border lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-black shadow-sm">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-text-primary">GreenConnect</span>
          </div>
          
          <div className="hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/50">Welcome Back</p>
            <p className="font-bold text-text-primary text-sm">{profile?.name ?? "Volunteer"}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Element */}
            <ThemeToggle />
            
            <div className="hidden text-right sm:block border-r border-border pr-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50">Eco Score</p>
              <p className="font-bold text-primary text-lg">{profile?.ecoScore ?? 0}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 text-xs font-bold text-primary shadow-sm">
                {profile?.name?.charAt(0).toUpperCase() ?? "G"}
              </div>
            </div>
          </div>
        </header>
 
        {/* Mobile Navigation bar */}
        <nav className="flex gap-1.5 overflow-x-auto glass mx-4 mt-3 p-2 rounded-xl border border-border lg:hidden shadow-md">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-all duration-200 ${
                  active 
                    ? "bg-[var(--sidebar-item-active)] text-[var(--active-filter-text)] border-[var(--active-filter-border)] dark:text-primary dark:border-primary shadow-[inset_0_1px_6px_rgba(16,185,129,0.08)]" 
                    : "text-text-secondary border-transparent hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] hover:bg-[var(--sidebar-item-hover)] hover:text-text-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Child components render space */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

