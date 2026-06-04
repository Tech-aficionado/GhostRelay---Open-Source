"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

export default function AnalyticsPage() {
  const { showToast } = useDashboard();
  const [overview, setOverview] = useState<api.AnalyticsOverview | null>(null);
  const [volume, setVolume] = useState<api.VolumeDataPoint[]>([]);
  const [topAliases, setTopAliases] = useState<api.TopAlias[]>([]);
  const [busiestDays, setBusiestDays] = useState<api.DayVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [overviewData, volumeData, topData, daysData] = await Promise.all([
        api.getAnalyticsOverview(token),
        api.getAnalyticsVolume(token, Number(timeRange)),
        api.getTopAliases(token),
        api.getBusiestDays(token),
      ]);
      setOverview(overviewData);
      setVolume(volumeData.volume);
      setTopAliases(topData.aliases);
      setBusiestDays(daysData.days);
    } catch {
      showToast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  const maxVolume = Math.max(...volume.map((v) => v.count), 1);
  const maxDayCount = Math.max(...busiestDays.map((d) => d.count), 1);

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
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--relay-text)]">Analytics</h1>
          <p className="text-[var(--relay-text-muted)] text-sm mt-1">
            Track your email alias activity and performance.
          </p>
        </div>
        <div className="flex gap-1 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-xl p-1 self-start">
          {(["7", "30", "90"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-smooth ${
                timeRange === range
                  ? "bg-[var(--relay-primary)]/10 text-[var(--relay-primary)] border border-[var(--relay-primary)]/30"
                  : "text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] border border-transparent"
              }`}
            >
              {range === "7" ? "7 days" : range === "30" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <StatCard label="Total Forwarded" value={overview.totalForwarded} color="var(--relay-primary)" />
          <StatCard label="Last 24h" value={overview.last24h} color="var(--relay-success)" />
          <StatCard label="Last 7 days" value={overview.last7d} color="var(--relay-accent)" />
          <StatCard label="Active Aliases" value={overview.activeAliases} color="var(--relay-primary)" />
          <StatCard label="Total Aliases" value={overview.totalAliases} color="var(--relay-text-muted)" />
          <StatCard label="Unique Senders (30d)" value={overview.uniqueSenders30d} color="var(--relay-warning)" />
        </div>
      )}

      {/* Volume Chart */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-8">
        <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-6">
          Daily Forwarding Volume
        </h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Aliases */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-[var(--relay-text)] mb-4">
            Most Active Aliases
          </h2>
          {topAliases.length === 0 || topAliases.every((a) => a.recentCount === 0) ? (
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
                    <div className="text-[10px] text-[var(--relay-text-dim)]">this period</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Busiest Days */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-[var(--relay-text)] mb-4">
            Busiest Days
          </h2>
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
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card p-5 rounded-2xl text-center">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--relay-text-muted)] mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
