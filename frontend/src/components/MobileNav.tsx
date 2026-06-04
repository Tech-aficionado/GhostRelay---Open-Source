"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  bounceCount?: number;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Aliases",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    href: "/dashboard/activity",
    label: "Activity",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    href: "/dashboard/bounces",
    label: "Bounces",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    href: "/dashboard/settings",
    label: "More",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  },
];

export default function MobileNav({ bounceCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--relay-surface)]/95 backdrop-blur-2xl border-t border-[var(--relay-border)] z-50 px-2 pt-2 pb-2 safe-area-bottom">
      <div className="flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const showBadge = item.href === "/dashboard/bounces" && bounceCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-smooth min-w-[56px] ${
                active
                  ? "text-[var(--relay-primary)]"
                  : "text-[var(--relay-text-dim)] active:text-[var(--relay-text-muted)]"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {showBadge && (
                <span className="absolute top-0.5 right-1 bg-[var(--relay-danger)] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bounceCount > 9 ? "!" : bounceCount}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-[var(--relay-primary)]"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
