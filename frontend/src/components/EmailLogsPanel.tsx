"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface EmailLogsPanelProps {
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function EmailLogsPanel({ onClose, onToast }: EmailLogsPanelProps) {
  const [logs, setLogs] = useState<api.EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  useEffect(() => {
    loadLogs();
  }, [offset]);

  const loadLogs = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.listEmailLogs(token, limit, offset);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      onToast("Failed to load email logs", "error");
    } finally {
      setLoading(false);
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

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--relay-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)]">Email Activity</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mt-0.5">
              Recent emails forwarded through your aliases
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-[var(--relay-text)] font-semibold mb-1">No activity yet</h3>
              <p className="text-sm text-[var(--relay-text-muted)]">
                Forwarded emails will appear here once your aliases start receiving mail.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-[var(--relay-border)] hover:border-[var(--relay-border-accent)] transition-smooth"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--relay-text)] truncate">
                        {log.subject || "(no subject)"}
                      </div>
                      <div className="text-xs text-[var(--relay-text-muted)] mt-1 truncate">
                        From: {log.sender}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-mono text-[var(--relay-primary)] truncate">
                          {log.aliasAddress}
                        </span>
                        {log.aliasLabel && (
                          <span className="text-[10px] bg-[var(--relay-primary)]/10 text-[var(--relay-primary)] px-1.5 py-0.5 rounded">
                            {log.aliasLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--relay-text-dim)] whitespace-nowrap flex-shrink-0">
                      {formatDate(log.forwardedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="p-4 border-t border-[var(--relay-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--relay-text-muted)]">
              Page {currentPage} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="text-xs border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-3 py-1.5 rounded-lg transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="text-xs border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-3 py-1.5 rounded-lg transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
