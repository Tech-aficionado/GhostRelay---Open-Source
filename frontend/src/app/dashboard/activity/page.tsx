"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

export default function ActivityPage() {
  const { showToast } = useDashboard();
  const [logs, setLogs] = useState<api.EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  useEffect(() => {
    loadLogs();
  }, [offset]);

  const loadLogs = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.listEmailLogs(token, limit, offset);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      showToast("Failed to load email logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    const token = getToken();
    if (!token) return;
    setRefreshing(true);
    try {
      const data = await api.listEmailLogs(token, limit, offset);
      setLogs(data.logs);
      setTotal(data.total);
      showToast("Activity refreshed", "success");
    } catch {
      showToast("Failed to refresh activity", "error");
    } finally {
      setRefreshing(false);
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
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--relay-text)]">Email Activity</h1>
          <p className="text-[var(--relay-text-muted)] text-sm mt-1">
            Recent emails forwarded through your aliases
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          aria-label="Refresh activity"
          className="inline-flex items-center gap-2 text-sm border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-4 py-2 rounded-xl transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={refreshing ? "animate-spin" : ""}
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-[var(--relay-text)] font-semibold text-lg mb-2">No activity yet</h3>
          <p className="text-sm text-[var(--relay-text-muted)] max-w-sm mx-auto">
            Forwarded emails will appear here once your aliases start receiving mail.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="glass-card p-5 rounded-2xl hover:border-[var(--relay-border-accent)] transition-smooth"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--relay-text)] truncate">
                      {log.subject || "(no subject)"}
                    </div>
                    <div className="text-xs text-[var(--relay-text-muted)] mt-1.5 truncate">
                      From: {log.sender}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
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

          {/* Pagination */}
          {total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-[var(--relay-text-muted)]">
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-4 py-2 rounded-xl transition-smooth disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-4 py-2 rounded-xl transition-smooth disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
