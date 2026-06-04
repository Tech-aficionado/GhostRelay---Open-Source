"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface BouncesPanelProps {
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function BouncesPanel({ onClose, onToast }: BouncesPanelProps) {
  const [bounces, setBounces] = useState<api.BounceData[]>([]);
  const [stats, setStats] = useState<api.BounceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [bouncesData, statsData] = await Promise.all([
        api.listBounces(token),
        api.getBounceStats(token),
      ]);
      setBounces(bouncesData.bounces);
      setStats(statsData);
    } catch {
      onToast("Failed to load bounce data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (bounceId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await api.acknowledgeBounce(bounceId, token);
      setBounces((prev) =>
        prev.map((b) => (b.id === bounceId ? { ...b, acknowledged: true } : b))
      );
    } catch {
      onToast("Failed to acknowledge bounce", "error");
    }
  };

  const handleDelete = async (bounceId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await api.deleteBounce(bounceId, token);
      setBounces((prev) => prev.filter((b) => b.id !== bounceId));
      onToast("Bounce record removed", "success");
    } catch {
      onToast("Failed to delete bounce", "error");
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

  const getBounceTypeColor = (type: string) => {
    switch (type) {
      case "hard":
        return "text-[var(--relay-danger)] bg-[var(--relay-danger)]/10";
      case "soft":
        return "text-[var(--relay-warning)] bg-[var(--relay-warning)]/10";
      case "complaint":
        return "text-orange-400 bg-orange-400/10";
      default:
        return "text-[var(--relay-text-muted)] bg-[var(--relay-border)]/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--relay-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)]">Email Bounces</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mt-0.5">
              Track delivery issues with your aliases
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

        {/* Tabs */}
        <div className="flex border-b border-[var(--relay-border)]">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-3 text-sm font-medium transition-smooth ${
              activeTab === "list"
                ? "text-[var(--relay-primary)] border-b-2 border-[var(--relay-primary)]"
                : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)]"
            }`}
          >
            Recent Bounces ({bounces.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-sm font-medium transition-smooth ${
              activeTab === "stats"
                ? "text-[var(--relay-primary)] border-b-2 border-[var(--relay-primary)]"
                : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)]"
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "list" ? (
            /* Bounce List */
            bounces.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-[var(--relay-text)] font-semibold mb-1">No bounces</h3>
                <p className="text-sm text-[var(--relay-text-muted)]">
                  All your emails are being delivered successfully.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bounces.map((bounce) => (
                  <div
                    key={bounce.id}
                    className={`p-4 rounded-xl border border-[var(--relay-border)] ${
                      !bounce.acknowledged ? "bg-[var(--relay-danger)]/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getBounceTypeColor(
                              bounce.bounceType
                            )}`}
                          >
                            {bounce.bounceType}
                          </span>
                          <span className="text-xs text-[var(--relay-text-dim)]">
                            {formatDate(bounce.bouncedAt)}
                          </span>
                        </div>
                        <div className="text-sm font-mono text-[var(--relay-primary)] truncate">
                          {bounce.aliasAddress}
                        </div>
                        <div className="text-xs text-[var(--relay-text-muted)] mt-1 truncate">
                          {bounce.bounceReason || "Delivery failed"}
                        </div>
                        {bounce.originalSender && (
                          <div className="text-xs text-[var(--relay-text-dim)] mt-0.5">
                            From: {bounce.originalSender}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {!bounce.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(bounce.id)}
                            className="text-[10px] border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-2 py-1 rounded-lg transition-smooth"
                          >
                            Dismiss
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(bounce.id)}
                          className="text-[10px] border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-2 py-1 rounded-lg transition-smooth"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Stats View */
            stats && (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border border-[var(--relay-border)] text-center">
                    <div className="text-2xl font-bold text-[var(--relay-text)]">{stats.totalBounces}</div>
                    <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Total</div>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--relay-border)] text-center">
                    <div className="text-2xl font-bold text-[var(--relay-danger)]">{stats.hardBounces}</div>
                    <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Hard</div>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--relay-border)] text-center">
                    <div className="text-2xl font-bold text-[var(--relay-warning)]">{stats.softBounces}</div>
                    <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Soft</div>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--relay-border)] text-center">
                    <div className="text-2xl font-bold text-orange-400">{stats.complaints}</div>
                    <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Spam</div>
                  </div>
                </div>

                {/* Unacknowledged warning */}
                {stats.unacknowledged > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--relay-danger)]/10 border border-[var(--relay-danger)]/20">
                    <p className="text-sm text-[var(--relay-danger)] font-medium">
                      ⚠ {stats.unacknowledged} unacknowledged bounce{stats.unacknowledged > 1 ? "s" : ""} need your attention
                    </p>
                  </div>
                )}

                {/* Top bouncing aliases */}
                {stats.topBouncingAliases.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-3">
                      Most Affected Aliases
                    </h3>
                    <div className="space-y-2">
                      {stats.topBouncingAliases.map((alias) => (
                        <div
                          key={alias.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[var(--relay-border)]"
                        >
                          <span className="text-sm font-mono text-[var(--relay-primary)] truncate">
                            {alias.address}
                          </span>
                          <span className="text-xs text-[var(--relay-danger)] font-medium flex-shrink-0 ml-3">
                            {alias.bounceCount} bounce{alias.bounceCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="p-4 rounded-xl bg-[var(--relay-primary)]/5 border border-[var(--relay-primary)]/20">
                  <h4 className="text-sm font-medium text-[var(--relay-text)] mb-2">About Bounces</h4>
                  <ul className="text-xs text-[var(--relay-text-muted)] space-y-1.5">
                    <li><strong className="text-[var(--relay-danger)]">Hard bounces</strong> — Permanent failure (invalid email, mailbox doesn&apos;t exist)</li>
                    <li><strong className="text-[var(--relay-warning)]">Soft bounces</strong> — Temporary issue (mailbox full, server down)</li>
                    <li><strong className="text-orange-400">Complaints</strong> — Recipient marked email as spam</li>
                    <li className="pt-1 text-[var(--relay-text-dim)]">Aliases with 5+ hard bounces are auto-disabled to protect deliverability.</li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
