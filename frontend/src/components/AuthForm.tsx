"use client";

import { useState, useEffect } from "react";
import { login, register, ApiError } from "@/lib/api";
import { saveAuthData, signInWithGoogle, setAuthProvider } from "@/lib/auth";
import { ForgotPasswordForm, ResetPasswordForm } from "./PasswordResetFlow";
import Logo from "./Logo";

interface AuthFormProps {
  onLogin: (email: string) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for reset token in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("reset_token");
      if (token) {
        setResetToken(token);
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || password.length < 8) {
      setError("Please enter a valid email and password (min 8 characters).");
      return;
    }

    setLoading(true);

    try {
      const authFn = isLoginMode ? login : register;
      const data = await authFn(email, password);

      // Store token, refresh token, session, and user
      saveAuthData({
        token: data.token,
        refreshToken: data.refreshToken,
        sessionId: data.sessionId,
        user: data.user,
      });
      setAuthProvider("email");
      onLogin(data.user.email);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Network error — API is unreachable
        console.error("API connection error:", err);
        setError(
          "Cannot connect to backend server. Make sure the worker is running on " +
          (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787") +
          ". Retrying will use demo mode."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const { user } = await signInWithGoogle();
      setAuthProvider("firebase");
      onLogin(user.email);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        // User closed the popup — not an error
        return;
      }
      if (firebaseError.code === "auth/cancelled-popup-request") {
        return;
      }
      console.error("Google sign-in error:", err);
      setError(firebaseError.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5 mesh-bg hero-glow">
      <div className="glass-card p-8 md:p-10 rounded-xl w-full max-w-sm relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] relay-gradient"></div>

        {/* Password Reset via token */}
        {resetToken ? (
          <>
            <div className="text-center mb-8">
              <Logo size={36} showText={false} className="justify-center mb-4" />
            </div>
            <ResetPasswordForm
              token={resetToken}
              onSuccess={() => {
                setResetToken(null);
                setIsLoginMode(true);
              }}
              onBack={() => setResetToken(null)}
            />
          </>
        ) : showForgotPassword ? (
          <>
            <div className="text-center mb-8">
              <Logo size={36} showText={false} className="justify-center mb-4" />
            </div>
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <Logo size={36} showText={false} className="justify-center mb-5" />
              <h2 className="text-xl font-bold text-[var(--relay-text)]">
                {isLoginMode ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-xs text-[var(--relay-text-muted)] mt-2">
                {isLoginMode ? "Log in to manage your aliases" : "Start protecting your email in seconds"}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[var(--relay-danger)]/8 border border-[var(--relay-danger)]/15 rounded-lg text-[var(--relay-danger)] text-xs leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.real@email.com"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth disabled:opacity-50 placeholder:text-[var(--relay-text-dim)]"
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth disabled:opacity-50 placeholder:text-[var(--relay-text-dim)]"
                />
              </div>

              {isLoginMode && (
                <div className="mb-5 text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-[var(--relay-primary)] hover:text-[var(--relay-primary-hover)] transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {!isLoginMode && <div className="mb-5" />}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold py-3 rounded-lg transition-smooth btn-glow disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading
                  ? "Please wait..."
                  : isLoginMode
                  ? "Log In"
                  : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--relay-border)]"></div>
              <span className="text-xs text-[var(--relay-text-dim)]">or</span>
              <div className="flex-1 h-px bg-[var(--relay-border)]"></div>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg hover:bg-[var(--relay-surface)] hover:border-[var(--relay-border-hover)] transition-smooth disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-[var(--relay-text)]"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <p className="text-center mt-6 text-xs text-[var(--relay-text-muted)]">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                }}
                className="text-[var(--relay-primary)] hover:text-[var(--relay-primary-hover)] transition-colors font-medium"
              >
                {isLoginMode ? "Sign Up" : "Log In"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
