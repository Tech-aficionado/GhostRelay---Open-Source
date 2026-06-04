"use client";

import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

interface DashboardNavProps {
  email: string;
  onLogout: () => void;
}

export default function DashboardNav({ email, onLogout }: DashboardNavProps) {
  return (
    <nav className="flex justify-between items-center px-5 md:px-8 py-3.5 border-b border-[var(--relay-border)] sticky top-0 bg-[var(--relay-bg)]/80 backdrop-blur-2xl z-50">
      <Link href="/" className="flex items-center">
        <Logo size={26} showText={true} />
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[var(--relay-card)] border border-[var(--relay-border)]">
          <div className="w-6 h-6 rounded-md relay-gradient flex items-center justify-center text-white text-[10px] font-bold">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[var(--relay-text-muted)] max-w-[140px] truncate font-medium">{email}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs border border-[var(--relay-border)] hover:border-[var(--relay-danger)]/50 text-[var(--relay-text-muted)] hover:text-[var(--relay-danger)] px-3.5 py-2 rounded-lg transition-smooth font-medium"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
