"use client";

import { useState, useEffect } from "react";
import * as api from "@/lib/api";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof api.ApiError) {
        setError(err.message);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-[var(--relay-success)]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          ✉️
        </div>
        <h2 className="text-xl font-bold text-[var(--relay-text)] mb-2">Check your email</h2>
        <p className="text-sm text-[var(--relay-text-muted)] mb-6">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your inbox (and spam folder).
        </p>
        <button
          onClick={onBack}
          className="text-[var(--relay-primary)] hover:text-[var(--relay-primary-hover)] transition-colors font-medium text-sm"
        >
          ← Back to login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--relay-text)] mb-2 text-center">Forgot password?</h2>
      <p className="text-sm text-[var(--relay-text-muted)] mb-6 text-center">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-[var(--relay-danger)]/10 border border-[var(--relay-danger)]/20 rounded-xl text-[var(--relay-danger)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="resetEmail" className="block text-sm font-medium text-[var(--relay-text-muted)] mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="resetEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.real@email.com"
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth disabled:opacity-50 placeholder:text-[var(--relay-text-dim)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold py-3.5 rounded-xl transition-smooth hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center mt-4">
        <button
          onClick={onBack}
          className="text-[var(--relay-primary)] hover:text-[var(--relay-primary-hover)] transition-colors font-medium text-sm"
        >
          ← Back to login
        </button>
      </p>
    </div>
  );
}

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ResetPasswordForm({ token, onSuccess, onBack }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const result = await api.verifyResetToken(token);
      setTokenValid(result.valid);
      if (!result.valid) {
        setError(result.error || "Invalid or expired reset link.");
      }
    } catch {
      setTokenValid(false);
      setError("Unable to verify reset link.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(onSuccess, 2000);
    } catch (err) {
      if (err instanceof api.ApiError) {
        setError(err.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-[var(--relay-danger)]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-[var(--relay-text)] mb-2">Invalid Reset Link</h2>
        <p className="text-sm text-[var(--relay-text-muted)] mb-6">{error}</p>
        <button
          onClick={onBack}
          className="text-[var(--relay-primary)] hover:text-[var(--relay-primary-hover)] transition-colors font-medium text-sm"
        >
          ← Back to login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-[var(--relay-success)]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-xl font-bold text-[var(--relay-text)] mb-2">Password Reset!</h2>
        <p className="text-sm text-[var(--relay-text-muted)]">
          Your password has been updated. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--relay-text)] mb-2 text-center">Set New Password</h2>
      <p className="text-sm text-[var(--relay-text-muted)] mb-6 text-center">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-[var(--relay-danger)]/10 border border-[var(--relay-danger)]/20 rounded-xl text-[var(--relay-danger)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--relay-text-muted)] mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            minLength={8}
            disabled={loading}
            className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth disabled:opacity-50 placeholder:text-[var(--relay-text-dim)]"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--relay-text-muted)] mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            minLength={8}
            disabled={loading}
            className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth disabled:opacity-50 placeholder:text-[var(--relay-text-dim)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold py-3.5 rounded-xl transition-smooth hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
