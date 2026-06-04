"use client";

import ThemeToggle from "./ThemeToggle";

interface DashboardTopBarProps {
  email: string;
  onLogout: () => void;
}

export default function DashboardTopBar({ email, onLogout }: DashboardTopBarProps) {
  return (
    <header className="flex justify-between items-center px-4 sm:px-5 md:px-10 py-3 sm:py-4 border-b border-[var(--relay-border)] sticky top-0 bg-[var(--relay-bg)]/80 backdrop-blur-2xl z-40">
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-8 h-8 relay-gradient rounded-md flex items-center justify-center text-white text-sm font-bold">
          G
        </div>
        <span className="text-base font-semibold text-[var(--relay-text)]">GhostRelay</span>
      </div>

      {/* Spacer for desktop (logo is in sidebar) */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[var(--relay-card)] border border-[var(--relay-border)]">
          <div className="w-7 h-7 rounded-md relay-gradient flex items-center justify-center text-white text-xs font-bold">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-[var(--relay-text-muted)] max-w-[160px] truncate font-medium">{email}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-danger)]/50 text-[var(--relay-text-muted)] hover:text-[var(--relay-danger)] px-4 py-2 rounded-lg transition-smooth font-medium"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
