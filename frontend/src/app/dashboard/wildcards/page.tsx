"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

export default function WildcardsPage() {
  const { showToast } = useDashboard();
  const [wildcards, setWildcards] = useState<api.WildcardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState("");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.listWildcards(token)
      .then((data) => setWildcards(data.wildcards))
      .catch(() => showToast("Failed to load wildcard rules", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleCreate = async () => {
    const token = getToken();
    if (!token || !pattern) return;

    if (!pattern.includes("*")) {
      showToast("Pattern must include at least one * wildcard", "error");
      return;
    }

    setCreating(true);
    try {
      const data = await api.createWildcard(pattern, label, token);
      setWildcards((prev) => [data.wildcard, ...prev]);
      setPattern("");
      setLabel("");
      showToast(`Wildcard rule created: ${data.wildcard.pattern}`, "success");
    } catch (err) {
      if (err instanceof api.ApiError) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to create wildcard rule", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const token = getToken();
    if (!token) return;

    const newActive = !currentActive;
    setWildcards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: newActive } : w))
    );

    try {
      await api.toggleWildcard(id, newActive, token);
    } catch {
      setWildcards((prev) =>
        prev.map((w) => (w.id === id ? { ...w, active: currentActive } : w))
      );
      showToast("Failed to update rule", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this wildcard rule?")) return;

    const token = getToken();
    if (!token) return;

    const prev = wildcards;
    setWildcards((p) => p.filter((w) => w.id !== id));

    try {
      await api.deleteWildcard(id, token);
      showToast("Wildcard rule deleted", "success");
    } catch {
      setWildcards(prev);
      showToast("Failed to delete rule", "error");
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
        <h1 className="text-2xl font-bold text-[var(--relay-text)]">Catch-All Wildcards</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Create patterns to automatically catch emails to any address matching the pattern.
        </p>
      </div>

      {/* Info */}
      <div className="glass-card p-5 rounded-2xl mb-6 border-[var(--relay-primary)]/20">
        <p className="text-sm text-[var(--relay-text-muted)]">
          Create patterns like <code className="text-[var(--relay-primary)] font-mono">*-shopping</code> to automatically catch emails to any address matching the pattern (e.g. <code className="font-mono">summer-shopping@ghostrelay.me</code>).
        </p>
      </div>

      {/* Create form */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h2 className="text-base font-semibold text-[var(--relay-text)] mb-4">Create New Rule</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value.toLowerCase())}
            placeholder="Pattern (e.g. *-shopping, team-*)"
            className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
          />
          <button
            onClick={handleCreate}
            disabled={!pattern || creating}
            className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-5 py-3 rounded-xl transition-smooth disabled:opacity-50 text-sm w-fit"
          >
            {creating ? "Creating..." : "+ Add Rule"}
          </button>
        </div>
      </div>

      {/* Existing rules */}
      {wildcards.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <div className="text-4xl mb-4">✳️</div>
          <h3 className="text-[var(--relay-text)] font-semibold text-lg mb-2">No wildcard rules</h3>
          <p className="text-sm text-[var(--relay-text-muted)]">
            Create one above to start catching emails with patterns.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {wildcards.map((rule) => (
            <div key={rule.id} className={`glass-card p-5 rounded-2xl ${!rule.active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[var(--relay-primary)] text-sm font-medium">
                    {rule.pattern}@ghostrelay.me
                  </div>
                  {rule.label && (
                    <div className="text-[var(--relay-text-muted)] text-xs mt-0.5">{rule.label}</div>
                  )}
                  <div className="text-[var(--relay-text-dim)] text-xs mt-1">
                    {rule.forwarded} emails matched
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={() => handleToggle(rule.id, rule.active)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--relay-border)] rounded-full peer peer-checked:bg-[var(--relay-success)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm"></div>
                  </label>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="text-xs border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-3 py-2 rounded-lg transition-smooth font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
