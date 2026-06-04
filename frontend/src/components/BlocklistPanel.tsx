"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface BlocklistPanelProps {
  aliasId: string;
  aliasAddress: string;
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function BlocklistPanel({ aliasId, aliasAddress, onClose, onToast }: BlocklistPanelProps) {
  const [blocked, setBlocked] = useState<api.BlockedSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadBlocked();
  }, []);

  const loadBlocked = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await api.listBlockedSenders(aliasId, token);
      setBlocked(data.blocked);
    } catch {
      onToast("Failed to load blocklist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      onToast("Please enter a valid email address", "error");
      return;
    }

    const token = getToken();
    if (!token) return;

    setAdding(true);
    try {
      const data = await api.blockSender(aliasId, email, token);
      setBlocked((prev) => [data.blocked, ...prev]);
      setNewEmail("");
      onToast(`Blocked ${email}`, "success");
    } catch (err) {
      if (err instanceof api.ApiError) {
        onToast(err.message, "error");
      } else {
        onToast("Failed to block sender", "error");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (blockId: string, email: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await api.unblockSender(aliasId, blockId, token);
      setBlocked((prev) => prev.filter((b) => b.id !== blockId));
      onToast(`Unblocked ${email}`, "success");
    } catch {
      onToast("Failed to unblock sender", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--relay-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)]">Sender Blocklist</h2>
            <p className="text-sm text-[var(--relay-text-muted)] mt-0.5 font-mono">
              {aliasAddress}
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

        {/* Add new block */}
        <form onSubmit={handleAdd} className="p-4 border-b border-[var(--relay-border)]">
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="sender@example.com"
              className="flex-1 px-4 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="bg-[var(--relay-danger)] hover:bg-[var(--relay-danger)]/80 text-white font-medium px-4 py-2.5 rounded-xl transition-smooth text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {adding ? "..." : "Block"}
            </button>
          </div>
          <p className="text-xs text-[var(--relay-text-dim)] mt-2">
            Blocked senders will be rejected at the server level — emails won&apos;t be forwarded.
          </p>
        </form>

        {/* Blocked list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blocked.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🛡️</div>
              <p className="text-sm text-[var(--relay-text-muted)]">
                No blocked senders. Add email addresses above to block them.
              </p>
            </div>
          ) : (
            blocked.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--relay-border)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[var(--relay-text)] truncate">{entry.senderEmail}</div>
                  <div className="text-xs text-[var(--relay-text-dim)]">Blocked {formatDate(entry.createdAt)}</div>
                </div>
                <button
                  onClick={() => handleRemove(entry.id, entry.senderEmail)}
                  className="text-xs border border-[var(--relay-border)] hover:border-[var(--relay-success)] text-[var(--relay-text-muted)] hover:text-[var(--relay-success)] px-3 py-1.5 rounded-lg transition-smooth font-medium flex-shrink-0 ml-3"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--relay-border)]">
          <p className="text-xs text-[var(--relay-text-dim)] text-center">
            Up to 50 senders can be blocked per alias.
          </p>
        </div>
      </div>
    </div>
  );
}
