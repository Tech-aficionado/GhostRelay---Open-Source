"use client";

import { DashboardProvider, useDashboard } from "@/lib/DashboardContext";
import AuthForm from "@/components/AuthForm";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopBar from "@/components/DashboardTopBar";
import MobileNav from "@/components/MobileNav";
import Toast from "@/components/Toast";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isDemo, bounceCount, toasts, handleLogout } = useDashboard();

  if (!user) {
    return (
      <AuthForm
        onLogin={(_email: string) => {
          // Reload after login to pick up user from localStorage
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--relay-bg)]">
      {/* Sidebar - desktop */}
      <DashboardSidebar bounceCount={bounceCount} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <DashboardTopBar email={user.email} onLogout={handleLogout} />

        {/* Demo notice */}
        {isDemo && (
          <div className="mx-4 md:mx-8 mt-3 md:mt-4 p-3 bg-[var(--relay-warning)]/8 border border-[var(--relay-warning)]/15 rounded-lg text-[var(--relay-warning)] text-xs text-center font-medium">
            Running in demo mode (data stored locally). Connect a backend for full functionality.
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-10 pb-28 md:pb-10 text-base">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav bounceCount={bounceCount} />

      {/* Toasts */}
      <div className="fixed bottom-20 md:bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}
