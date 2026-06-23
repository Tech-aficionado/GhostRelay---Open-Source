"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

export default function SecurityPage() {
  const { showToast } = useDashboard();

  // Security score
  const [score, setScore] = useState<number | null>(null);
  const [rating, setRating] = useState("");
  const [factors, setFactors] = useState<api.SecurityFactor[]>([]);
  const [loadingScore, setLoadingScore] = useState(true);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<"enable" | "disable">("enable");
  const [otpCode, setOtpCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<api.Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<api.EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadSecurityScore = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingScore(false); return; }
    try {
      const data = await api.getSecurityScore(token);
      setScore(data.score);
      setRating(data.rating);
      setFactors(data.factors);
    } catch {
      // Silently fail — score section will show placeholder
    } finally {
      setLoadingScore(false);
    }
  }, []);

  const load2FAStatus = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading2FA(false); return; }
    try {
      const data = await api.get2FAStatus(token);
      setTwoFactorEnabled(data.enabled);
    } catch {
      // Default to disabled
    } finally {
      setLoading2FA(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingSessions(false); return; }
    try {
      const data = await api.listSessions(token);
      setSessions(data.sessions);
    } catch {
      // Silently fail
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadActivityLogs = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingLogs(false); return; }
    try {
      const data = await api.listEmailLogs(token, 10, 0);
      setActivityLogs(data.logs);
    } catch {
      // Silently fail
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadSecurityScore();
    load2FAStatus();
    loadSessions();
    loadActivityLogs();
  }, [loadSecurityScore, load2FAStatus, loadSessions, loadActivityLogs]);

  // 2FA handlers
  const handleSendCode = async (purpose: "enable" | "disable") => {
    const token = getToken();
    if (!token) return;

    setSendingCode(true);
    try {
      await api.send2FACode(purpose, token);
      setOtpPurpose(purpose);
      setShowOTPInput(true);
      setOtpCode("");
      showToast("Verification code sent to your email", "success");
    } catch (err) {
      showToast(err instanceof api.ApiError ? err.message : "Failed to send code", "error");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const token = getToken();
    if (!token) return;
    if (otpCode.length !== 6) {
      showToast("Enter the 6-digit code from your email", "error");
      return;
    }

    setVerifyingCode(true);
    try {
      if (otpPurpose === "enable") {
        await api.enable2FA(otpCode, token);
        setTwoFactorEnabled(true);
        showToast("Two-factor authentication enabled", "success");
      } else {
        await api.disable2FA(otpCode, token);
        setTwoFactorEnabled(false);
        showToast("Two-factor authentication disabled", "success");
      }
      setShowOTPInput(false);
      setOtpCode("");
      loadSecurityScore();
    } catch (err) {
      showToast(err instanceof api.ApiError ? err.message : "Invalid code", "error");
    } finally {
      setVerifyingCode(false);
    }
  };

  // Session handlers
  const handleRevoke = async (sessionId: string) => {
    const token = getToken();
    if (!token) return;
    if (!confirm("Revoke this session? The device will be logged out.")) return;

    try {
      await api.revokeSession(sessionId, token);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast("Session revoked", "success");
      loadSecurityScore();
    } catch {
      showToast("Failed to revoke session", "error");
    }
  };

  const handleRevokeAll = async () => {
    const token = getToken();
    if (!token) return;
    if (!confirm("Revoke all other sessions? All other devices will be logged out.")) return;

    setRevokingAll(true);
    try {
      const result = await api.revokeAllOtherSessions(token);
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      showToast(result.message, "success");
      loadSecurityScore();
    } catch {
      showToast("Failed to revoke sessions", "error");
    } finally {
      setRevokingAll(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = () => {
    if (score === null) return "var(--relay-text-muted)";
    if (score >= 90) return "var(--relay-success)";
    if (score >= 70) return "var(--relay-primary)";
    if (score >= 50) return "var(--relay-warning)";
    return "var(--relay-danger)";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--relay-text)]">Security</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Manage your account security, sessions, and activity.
        </p>
      </div>

      {/* Security Score */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        {loadingScore ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div
                className="w-20 h-20 rounded-full border-4 flex items-center justify-center"
                style={{ borderColor: getScoreColor() }}
              >
                <span className="text-2xl font-bold" style={{ color: getScoreColor() }}>
                  {score ?? "—"}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-1">
                  Security Score: {rating || "Unknown"}
                </h2>
                <p className="text-sm text-[var(--relay-text-muted)] mb-3">
                  {score !== null && score < 100
                    ? "Complete the items below to improve your score."
                    : score === 100
                    ? "Your account is fully secured."
                    : "Loading..."}
                </p>
                <div className="w-full h-2 bg-[var(--relay-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score ?? 0}%`, backgroundColor: getScoreColor() }}
                  />
                </div>
              </div>
            </div>

            {factors.length > 0 && (
              <div className="space-y-2">
                {factors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--relay-bg)] border border-[var(--relay-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          factor.achieved
                            ? "bg-[var(--relay-success)]/20 text-[var(--relay-success)]"
                            : "bg-[var(--relay-border)] text-[var(--relay-text-dim)]"
                        }`}
                      >
                        {factor.achieved ? "✓" : "○"}
                      </div>
                      <span className="text-sm text-[var(--relay-text)]">{factor.label}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--relay-text-muted)]">
                      +{factor.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Two-Factor Auth */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--relay-text)]">Two-Factor Authentication</h2>
          {loading2FA ? (
            <div className="w-5 h-5 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                twoFactorEnabled
                  ? "bg-[var(--relay-success)]/10 text-[var(--relay-success)]"
                  : "bg-[var(--relay-warning)]/10 text-[var(--relay-warning)]"
              }`}
            >
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--relay-text-muted)] mb-4">
          Add an extra layer of security. When enabled, you&apos;ll receive a verification code via email when logging in from a new device.
        </p>

        {!showOTPInput ? (
          <button
            onClick={() => handleSendCode(twoFactorEnabled ? "disable" : "enable")}
            disabled={sendingCode || loading2FA}
            className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-smooth disabled:opacity-50 ${
              twoFactorEnabled
                ? "border border-[var(--relay-danger)]/30 text-[var(--relay-danger)] hover:bg-[var(--relay-danger)]/10"
                : "bg-[var(--relay-primary)] text-white hover:bg-[var(--relay-primary-hover)] btn-glow"
            }`}
          >
            {sendingCode
              ? "Sending code..."
              : twoFactorEnabled
              ? "Disable 2FA"
              : "Enable 2FA"}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="px-4 py-2.5 rounded-xl border border-[var(--relay-border)] bg-[var(--relay-bg)] text-[var(--relay-text)] text-sm font-mono tracking-widest w-48 focus:outline-none focus:ring-2 focus:ring-[var(--relay-primary)]/50"
              aria-label="Verification code"
            />
            <button
              onClick={handleVerifyCode}
              disabled={verifyingCode || otpCode.length !== 6}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[var(--relay-primary)] text-white hover:bg-[var(--relay-primary-hover)] btn-glow transition-smooth disabled:opacity-50"
            >
              {verifyingCode ? "Verifying..." : "Verify Code"}
            </button>
            <button
              onClick={() => {
                setShowOTPInput(false);
                setOtpCode("");
              }}
              className="text-sm font-medium text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] px-3 py-2.5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--relay-text)]">Active Sessions</h2>
          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <button
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="text-sm text-[var(--relay-danger)] font-medium hover:underline disabled:opacity-50"
            >
              {revokingAll ? "Revoking..." : "Revoke all other sessions"}
            </button>
          )}
        </div>
        {loadingSessions ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-[var(--relay-text-muted)] text-center py-4">
            No active sessions found.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-[var(--relay-bg)] border ${
                  session.isCurrent
                    ? "border-[var(--relay-primary)]/40"
                    : "border-[var(--relay-border)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      session.isCurrent
                        ? "bg-[var(--relay-success)]"
                        : "bg-[var(--relay-text-dim)]"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-[var(--relay-text)]">
                      {session.deviceName || "Unknown device"}
                    </div>
                    <div className="text-xs text-[var(--relay-text-dim)]">
                      IP: {session.ipAddress} • Last active:{" "}
                      {formatDate(session.lastUsedAt)}
                    </div>
                  </div>
                </div>
                {session.isCurrent ? (
                  <span className="text-xs font-medium text-[var(--relay-success)] bg-[var(--relay-success)]/10 px-2.5 py-1 rounded-full">
                    Current
                  </span>
                ) : (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    className="text-xs text-[var(--relay-danger)] font-medium border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] hover:text-white px-3 py-1.5 rounded-lg transition-smooth"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--relay-text)]">Recent Activity</h2>
          <a
            href="/dashboard/activity"
            className="text-xs text-[var(--relay-primary)] font-medium hover:underline"
          >
            View all
          </a>
        </div>
        {loadingLogs ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activityLogs.length === 0 ? (
          <p className="text-sm text-[var(--relay-text-muted)] text-center py-6">
            No email activity yet. Forwarded emails will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--relay-bg)] border border-[var(--relay-border)]"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--relay-success)] mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--relay-text)] truncate">
                      {log.subject || "(no subject)"}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--relay-text-muted)] mt-0.5 truncate">
                    {log.sender} → {log.aliasAddress}
                  </div>
                </div>
                <span className="text-xs text-[var(--relay-text-dim)] whitespace-nowrap flex-shrink-0">
                  {formatDate(log.forwardedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
