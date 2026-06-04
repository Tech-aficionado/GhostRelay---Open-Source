"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface WildcardsPanelProps {
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function WildcardsPanel({ onClose, onToast }: WildcardsPanelProps) {
  const [wildcards, setWildcards] = useState<api.WildcardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState("");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api.listWildcards(token)
      .then((data) => setWildcards(data.wildcards))
      .catch(() => onToast("Failed to load wildcard rules", "error"))
      .finally(() => setLoading(false));
  }, [onToast]);

  const handleCreate = async () => {
    const token = getToken();
    if (!token || !pattern) return;

    if (!pattern.includes("*")) {
      onToast("Pattern must include at least one * wildcard", "error");
      return;
    }

    setCreating(true);
    try {
      const data = await api.createWildcard(pattern, label, token);
      setWildcards((prev) => [data.wildcard, ...prev]);
      setPattern("");
      setLabel("");
      onToast(`Wildcard rule created: ${data.wildcard.pattern}`, "success");
    } catch (err) {
      if (err instanceof api.ApiError) {
        onToast(err.message, "error");
      } else {
        onToast("Failed to create wildcard rule", "error");
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
      onToast("Failed to update rule", "error");
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
      onToast("Wildcard rule deleted", "success");
    } catch {
      setWildcards(prev);
      onToast("Failed to delete rule", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-8 rounded-2xl w-full max-w-lg z-10 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--relay-text)]">Catch-All Wildcards</h2>
          <button onClick={onClose} className="text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] text-xl">✕</button>
        </div>

        <p className="text-sm text-[var(--relay-text-muted)] mb-4">
          Create patterns like <code className="text-[var(--relay-primary)]">*-shopping</code> to automatically catch emails to any address matching the pattern (e.g. <code>summer-shopping@ghostrelay.me</code>).
        </p>

        {/* Create form */}
        <div className="flex flex-col gap-3 mb-6 p-4 bg-[var(--relay-bg)] rounded-xl border border-[var(--relay-border)]">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value.toLowerCase())}
            placeholder="Pattern (e.g. *-shopping, team-*)"
            className="w-full px-3 py-2.5 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] transition-smooth placeholder:text-[var(--relay-text-dim)]"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            className="w-full px-3 py-2.5 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] transition-smooth placeholder:text-[var(--relay-text-dim)]"
          />
          <button
            onClick={handleCreate}
            disabled={!pattern || creating}
            className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-4 py-2.5 rounded-lg transition-smooth disabled:opacity-50 text-sm"
          >
            {creating ? "Creating..." : "+ Add Rule"}
          </button>
        </div>

        {/* Existing rules */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : wildcards.length === 0 ? (
          <p className="text-center text-[var(--relay-text-muted)] text-sm py-8">
            No wildcard rules yet. Create one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {wildcards.map((rule) => (
              <div key={rule.id} className={`p-4 bg-[var(--relay-bg)] rounded-xl border border-[var(--relay-border)] ${!rule.active ? "opacity-50" : ""}`}>
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
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => handleToggle(rule.id, rule.active)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[var(--relay-border)] rounded-full peer peer-checked:bg-[var(--relay-success)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 after:shadow-sm"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-xs border border-[var(--relay-danger)]/20 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-2.5 py-1.5 rounded-lg transition-smooth"
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
    </div>
  );
}
