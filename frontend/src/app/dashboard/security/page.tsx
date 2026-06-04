"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

const mockActivityLog = [
  { action: "Login", detail: "Chrome on macOS", time: "2 minutes ago", type: "info" },
  { action: "Alias created", detail: "shopping-new@ghostrelay.me", time: "1 hour ago", type: "success" },
  { action: "Alias disabled", detail: "old-sub@ghostrelay.me", time: "3 hours ago", type: "warning" },
  { action: "Password changed", detail: "Via email verification", time: "2 days ago", type: "info" },
  { action: "Login attempt blocked", detail: "Unknown device from Russia", time: "5 days ago", type: "danger" },
];

export default function SecurityPage() {
  const { showToast } = useDashboard();
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState<api.Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const token = getToken();
    if (!token) {
      setLoadingSessions(false);
      return;
    }
    try {
      const data = await api.listSessions(token);
      setSessions(data.sessions);
    } catch {
      showToast("Failed to load sessions", "error");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    const token = getToken();
    if (!token) return;
    if (!confirm("Revoke this session? The device will be logged out.")) return;

    try {
      await api.revokeSession(sessionId, token);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast("Session revoked", "success");
    } catch {
      showToast("Failed to revoke session", "error");
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--relay-text)]">Security</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Manage your account security and active sessions.
        </p>
      </div>

      {/* Security Score */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-[var(--relay-success)] flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--relay-success)]">85</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-1">Security Score: Good</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mb-3">Your account is well-protected. Enable 2FA to reach 100%.</p>
            <div className="w-full h-2 bg-[var(--relay-border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--relay-success)] rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Auth */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--relay-text)]">Two-Factor Authentication</h2>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            twoFactor
              ? "bg-[var(--relay-success)]/10 text-[var(--relay-success)]"
              : "bg-[var(--relay-warning)]/10 text-[var(--relay-warning)]"
          }`}>
            {twoFactor ? "Enabled" : "Disabled"}
          </span>
        </div>
        <p className="text-sm text-[var(--relay-text-muted)] mb-4">
          Add an extra layer of security to your account. You&apos;ll need your phone to log in.
        </p>
        <button
          onClick={() => setTwoFactor(!twoFactor)}
          className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-smooth ${
            twoFactor
              ? "border border-[var(--relay-danger)]/30 text-[var(--relay-danger)] hover:bg-[var(--relay-danger)]/10"
              : "bg-[var(--relay-primary)] text-white hover:bg-[var(--relay-primary-hover)] btn-glow"
          }`}
        >
          {twoFactor ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </div>

      {/* Active Sessions */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--relay-text)]">Active Sessions</h2>
          <button className="text-sm text-[var(--relay-danger)] font-medium hover:underline">
            Revoke all other sessions
          </button>
        </div>
        {loadingSessions ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-[var(--relay-text-muted)] text-center py-4">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl bg-[var(--relay-bg)] border ${
                session.isCurrent ? "border-[var(--relay-primary)]/40" : "border-[var(--relay-border)]"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.isCurrent ? "bg-[var(--relay-success)]" : "bg-[var(--relay-text-dim)]"}`} />
                  <div>
                    <div className="text-sm font-medium text-[var(--relay-text)]">{session.deviceName || "Unknown device"}</div>
                    <div className="text-xs text-[var(--relay-text-dim)]">
                      IP: {session.ipAddress} • Last active: {formatDate(session.lastUsedAt)}
                    </div>
                  </div>
                </div>
                {session.isCurrent ? (
                  <span className="text-xs font-medium text-[var(--relay-success)] bg-[var(--relay-success)]/10 px-2.5 py-1 rounded-full">Current</span>
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

      {/* Activity Log */}
      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-5">Recent Activity</h2>
        <div className="space-y-3">
          {mockActivityLog.map((log, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                log.type === "success" ? "bg-[var(--relay-success)]" :
                log.type === "warning" ? "bg-[var(--relay-warning)]" :
                log.type === "danger" ? "bg-[var(--relay-danger)]" :
                "bg-[var(--relay-primary)]"
              }`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--relay-text)]">{log.action}</div>
                <div className="text-xs text-[var(--relay-text-muted)]">{log.detail}</div>
              </div>
              <span className="text-xs text-[var(--relay-text-dim)] whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
