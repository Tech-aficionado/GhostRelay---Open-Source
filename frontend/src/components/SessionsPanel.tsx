"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface SessionsPanelProps {
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function SessionsPanel({ onClose, onToast }: SessionsPanelProps) {
  const [sessions, setSessions] = useState<api.Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await api.listSessions(token);
      setSessions(data.sessions);
    } catch (err) {
      onToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    const token = getToken();
    if (!token) return;

    if (!confirm("Revoke this session? The device will be logged out.")) return;

    try {
      await api.revokeSession(sessionId, token);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      onToast("Session revoked", "success");
    } catch {
      onToast("Failed to revoke session", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--relay-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)]">Active Sessions</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mt-0.5">
              Manage devices logged into your account
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-smooth text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-[var(--relay-text-muted)] py-8">
              No active sessions found.
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border ${
                  session.isCurrent
                    ? "border-[var(--relay-primary)]/40 bg-[var(--relay-primary)]/5"
                    : "border-[var(--relay-border)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--relay-text)]">
                        {session.deviceName || "Unknown device"}
                      </span>
                      {session.isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-[var(--relay-primary)]/20 text-[var(--relay-primary)] px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--relay-text-muted)] mt-1 space-y-0.5">
                      <div>IP: {session.ipAddress}</div>
                      <div>Last active: {formatDate(session.lastUsedAt)}</div>
                      <div>Created: {formatDate(session.createdAt)}</div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      className="text-xs border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-3 py-1.5 rounded-lg transition-smooth font-medium flex-shrink-0"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--relay-border)]">
          <p className="text-xs text-[var(--relay-text-dim)] text-center">
            Sessions expire after 30 days of inactivity. Revoking a session logs that device out immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
