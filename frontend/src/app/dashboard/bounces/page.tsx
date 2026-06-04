"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

export default function BouncesPage() {
  const { showToast, setBounceCount } = useDashboard();
  const [bounces, setBounces] = useState<api.BounceData[]>([]);
  const [stats, setStats] = useState<api.BounceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [bouncesData, statsData] = await Promise.all([
        api.listBounces(token),
        api.getBounceStats(token),
      ]);
      setBounces(bouncesData.bounces);
      setStats(statsData);
      setBounceCount(statsData.unacknowledged);
    } catch {
      showToast("Failed to load bounce data", "error");
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
      setBounceCount((prev: number) => Math.max(0, prev - 1));
    } catch {
      showToast("Failed to acknowledge bounce", "error");
    }
  };

  const handleDelete = async (bounceId: string) => {
    const token = getToken();
    if (!token) return;
    const bounce = bounces.find((b) => b.id === bounceId);
    try {
      await api.deleteBounce(bounceId, token);
      setBounces((prev) => prev.filter((b) => b.id !== bounceId));
      if (bounce && !bounce.acknowledged) {
        setBounceCount((prev: number) => Math.max(0, prev - 1));
      }
      showToast("Bounce record removed", "success");
    } catch {
      showToast("Failed to delete bounce", "error");
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--relay-text)]">Email Bounces</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Track delivery issues with your aliases
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-xl p-1 mb-8 w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === "list"
              ? "bg-[var(--relay-primary)]/10 text-[var(--relay-primary)] border border-[var(--relay-primary)]/30"
              : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] border border-transparent"
          }`}
        >
          Recent Bounces ({bounces.length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === "stats"
              ? "bg-[var(--relay-primary)]/10 text-[var(--relay-primary)] border border-[var(--relay-primary)]/30"
              : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] border border-transparent"
          }`}
        >
          Statistics
        </button>
      </div>

      {activeTab === "list" ? (
        bounces.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-[var(--relay-text)] font-semibold text-lg mb-2">No bounces</h3>
            <p className="text-sm text-[var(--relay-text-muted)]">
              All your emails are being delivered successfully.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bounces.map((bounce) => (
              <div
                key={bounce.id}
                className={`glass-card p-5 rounded-2xl ${
                  !bounce.acknowledged ? "border-[var(--relay-danger)]/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getBounceTypeColor(bounce.bounceType)}`}
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
                        className="text-xs border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] px-3 py-1.5 rounded-lg transition-smooth"
                      >
                        Dismiss
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(bounce.id)}
                      className="text-xs border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-3 py-1.5 rounded-lg transition-smooth"
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
        stats && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="text-2xl font-bold text-[var(--relay-text)]">{stats.totalBounces}</div>
                <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Total</div>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="text-2xl font-bold text-[var(--relay-danger)]">{stats.hardBounces}</div>
                <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Hard</div>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="text-2xl font-bold text-[var(--relay-warning)]">{stats.softBounces}</div>
                <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">Soft</div>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
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
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-[var(--relay-text)] mb-4">
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
            <div className="glass-card p-6 rounded-2xl border-[var(--relay-primary)]/20">
              <h4 className="text-sm font-medium text-[var(--relay-text)] mb-3">About Bounces</h4>
              <ul className="text-xs text-[var(--relay-text-muted)] space-y-2">
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
  );
}
