"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-14 rounded-full bg-card-opacity-bg border border-border animate-pulse shrink-0" />
    );
  }

  if (pathname === "/map") {
    return (
      <div
        className="relative flex h-8 w-14 items-center justify-between rounded-full bg-card-opacity-bg border border-border p-1.5 opacity-60 cursor-not-allowed shrink-0"
        title="Map page always uses light mode for readability"
      >
        <div className="absolute top-1 left-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-black shadow-md translate-x-6">
          <Sun className="h-3 w-3 stroke-[2.5]" />
        </div>
        <Sun className="h-3.5 w-3.5 text-text-secondary opacity-80" />
        <Moon className="h-3.5 w-3.5 text-text-primary opacity-0" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-14 cursor-pointer items-center justify-between rounded-full bg-card-opacity-bg border border-border p-1.5 transition-all duration-300 hover:border-border-strong focus:outline-none shrink-0"
      aria-label="Toggle visual theme"
    >
      <div
        className={`absolute top-1 left-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-black shadow-md transition-transform duration-300 ease-out ${
          theme === "light" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {theme === "light" ? (
          <Sun className="h-3 w-3 stroke-[2.5]" />
        ) : (
          <Moon className="h-3 w-3 stroke-[2.5]" />
        )}
      </div>

      {/* Sun Icon (Dark Mode Option Indicator) */}
      <Sun
        className={`h-3.5 w-3.5 transition-opacity duration-300 ${
          theme === "light" ? "text-text-secondary opacity-80" : "text-text-primary opacity-0"
        }`}
      />

      {/* Moon Icon (Light Mode Option Indicator) */}
      <Moon
        className={`h-3.5 w-3.5 transition-opacity duration-300 ${
          theme === "light" ? "text-text-primary opacity-0" : "text-text-secondary opacity-80"
        }`}
      />
    </button>
  );
}
