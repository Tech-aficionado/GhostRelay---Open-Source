"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getToken, getStoredUser, clearAuth, getAuthProvider, firebaseSignOut, onFirebaseAuthChanged, getFirebaseToken, removeAuthProvider, getRefreshToken } from "@/lib/auth";
import * as api from "@/lib/api";
import type { User, ToastMessage } from "@/lib/types";

interface DashboardContextValue {
  user: User | null;
  isDemo: boolean;
  bounceCount: number;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error") => void;
  handleLogout: () => Promise<void>;
  setBounceCount: React.Dispatch<React.SetStateAction<number>>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleLogout = useCallback(async () => {
    const provider = getAuthProvider();

    if (provider === "firebase") {
      await firebaseSignOut();
      removeAuthProvider();
    } else {
      const token = getToken();
      if (token && !isDemo) {
        try {
          await api.logout(token);
        } catch {
          // Proceed with local logout even if server call fails
        }
      }
      clearAuth();
      removeAuthProvider();
    }

    setUser(null);
    window.location.href = "/dashboard";
  }, [isDemo]);

  useEffect(() => {
    const provider = getAuthProvider();

    if (provider === "firebase") {
      // Listen for Firebase auth state changes
      let unsubscribe: (() => void) | null = null;
      let refreshInterval: NodeJS.Timeout | null = null;

      onFirebaseAuthChanged(async (firebaseUser) => {
        if (firebaseUser) {
          setUser({ id: firebaseUser.uid, email: firebaseUser.email || "" });
          // Get fresh token and store it for API calls
          const token = await getFirebaseToken();
          if (token) {
            const { setToken: saveToken } = await import("@/lib/auth");
            saveToken(token);
          }

          // Refresh Firebase token every 50 minutes (they expire in 60 min)
          refreshInterval = setInterval(async () => {
            const freshToken = await getFirebaseToken();
            if (freshToken) {
              const { setToken: saveToken } = await import("@/lib/auth");
              saveToken(freshToken);
            }
          }, 50 * 60 * 1000);
        } else {
          setUser(null);
        }
        setLoading(false);
      }).then((unsub) => {
        unsubscribe = unsub;
      });

      return () => {
        if (unsubscribe) unsubscribe();
        if (refreshInterval) clearInterval(refreshInterval);
      };
    } else {
      // Existing email/password auth flow
      const storedUser = getStoredUser();
      if (storedUser) {
        const token = getToken();
        const refreshToken = getRefreshToken();

        // If no token AND no refresh token, the session is dead — clear and show login
        if (!token && !refreshToken) {
          clearAuth();
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(storedUser);
        const demoMode = !token && !refreshToken;
        setIsDemo(demoMode);

        // Validate session by loading bounce stats (lightweight API call)
        if (!demoMode && token) {
          api.getBounceStats(token).then((stats) => {
            setBounceCount(stats.unacknowledged);
          }).catch((err) => {
            // If the API call triggers auto-refresh and that also fails,
            // the apiRequest function will clear auth and redirect.
            // But if it's just a network error, don't log out.
            if (err instanceof api.ApiError && err.status === 401) {
              // Auth completely failed — user will be redirected by apiRequest
              setUser(null);
            }
          });
        }
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        user,
        isDemo,
        bounceCount,
        toasts,
        showToast,
        handleLogout,
        setBounceCount,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}
