"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface AnalyticsPanelProps {
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function AnalyticsPanel({ onClose, onToast }: AnalyticsPanelProps) {
  const [overview, setOverview] = useState<api.AnalyticsOverview | null>(null);
  const [volume, setVolume] = useState<api.VolumeDataPoint[]>([]);
  const [topAliases, setTopAliases] = useState<api.TopAlias[]>([]);
  const [busiestDays, setBusiestDays] = useState<api.DayVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "volume" | "aliases" | "days">("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [overviewData, volumeData, topData, daysData] = await Promise.all([
        api.getAnalyticsOverview(token),
        api.getAnalyticsVolume(token, 30),
        api.getTopAliases(token),
        api.getBusiestDays(token),
      ]);
      setOverview(overviewData);
      setVolume(volumeData.volume);
      setTopAliases(topData.aliases);
      setBusiestDays(daysData.days);
    } catch {
      onToast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  const maxVolume = Math.max(...volume.map((v) => v.count), 1);
  const maxDayCount = Math.max(...busiestDays.map((d) => d.count), 1);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--relay-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)]">Usage Analytics</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mt-0.5">
              Forwarding insights for the last 30 days
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
        <div className="flex border-b border-[var(--relay-border)] overflow-x-auto">
          {(["overview", "volume", "aliases", "days"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] py-3 text-xs sm:text-sm font-medium transition-smooth whitespace-nowrap px-2 ${
                activeTab === tab
                  ? "text-[var(--relay-primary)] border-b-2 border-[var(--relay-primary)]"
                  : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)]"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "volume" && "Volume"}
              {tab === "aliases" && "Top Aliases"}
              {tab === "days" && "By Day"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "overview" && overview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Total Forwarded" value={overview.totalForwarded} color="var(--relay-primary)" />
                <StatCard label="Last 24h" value={overview.last24h} color="var(--relay-success)" />
                <StatCard label="Last 7 days" value={overview.last7d} color="var(--relay-accent)" />
                <StatCard label="Active Aliases" value={overview.activeAliases} color="var(--relay-primary)" />
                <StatCard label="Total Aliases" value={overview.totalAliases} color="var(--relay-text-muted)" />
                <StatCard label="Unique Senders (30d)" value={overview.uniqueSenders30d} color="var(--relay-warning)" />
              </div>
            </div>
          ) : activeTab === "volume" ? (
            <div>
              <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-4">
                Daily forwarding volume (last 30 days)
              </h3>
              {volume.length === 0 ? (
                <p className="text-sm text-[var(--relay-text-muted)] text-center py-8">
                  No data yet. Emails will appear here as they are forwarded.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {volume.map((point) => (
                    <div key={point.date} className="flex items-center gap-3">
                      <span className="text-[10px] text-[var(--relay-text-dim)] w-16 flex-shrink-0">
                        {new Date(point.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="flex-1 h-5 bg-[var(--relay-border)]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full relay-gradient transition-all"
                          style={{ width: `${(point.count / maxVolume) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--relay-text-muted)] w-8 text-right">{point.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "aliases" ? (
            <div>
              <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-4">
                Most active aliases (last 30 days)
              </h3>
              {topAliases.length === 0 ? (
                <p className="text-sm text-[var(--relay-text-muted)] text-center py-8">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {topAliases.filter((a) => a.recentCount > 0).map((alias, i) => (
                    <div
                      key={alias.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--relay-border)]"
                    >
                      <span className="text-xs font-bold text-[var(--relay-text-dim)] w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono text-[var(--relay-primary)] truncate">{alias.address}</div>
                        {alias.label && (
                          <div className="text-xs text-[var(--relay-text-muted)]">{alias.label}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[var(--relay-text)]">{alias.recentCount}</div>
                        <div className="text-[10px] text-[var(--relay-text-dim)]">this month</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "days" ? (
            <div>
              <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-4">
                Busiest days of the week
              </h3>
              {busiestDays.every((d) => d.count === 0) ? (
                <p className="text-sm text-[var(--relay-text-muted)] text-center py-8">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {busiestDays.map((day) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--relay-text-muted)] w-20 flex-shrink-0">{day.day}</span>
                      <div className="flex-1 h-7 bg-[var(--relay-border)]/30 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all"
                          style={{
                            width: `${(day.count / maxDayCount) * 100}%`,
                            background: `var(--relay-primary)`,
                            opacity: 0.7 + (day.count / maxDayCount) * 0.3,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[var(--relay-text)] w-8 text-right">{day.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--relay-border)] text-center">
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
