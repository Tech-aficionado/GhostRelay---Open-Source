"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface DestinationsPanelProps {
  aliasId: string;
  aliasAddress: string;
  onClose: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

export default function DestinationsPanel({ aliasId, aliasAddress, onClose, onToast }: DestinationsPanelProps) {
  const [destinations, setDestinations] = useState<api.Destination[]>([]);
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api.listDestinations(aliasId, token)
      .then((data) => {
        setDestinations(data.destinations);
        setPrimaryEmail(data.primaryEmail);
      })
      .catch(() => onToast("Failed to load destinations", "error"))
      .finally(() => setLoading(false));
  }, [aliasId, onToast]);

  const handleAdd = async () => {
    const token = getToken();
    if (!token || !newEmail) return;

    setAdding(true);
    try {
      const data = await api.addDestination(aliasId, newEmail, token);
      setDestinations((prev) => [...prev, data.destination]);
      setNewEmail("");
      onToast("Destination added", "success");
    } catch (err) {
      if (err instanceof api.ApiError) {
        onToast(err.message, "error");
      } else {
        onToast("Failed to add destination", "error");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (destId: string) => {
    const token = getToken();
    if (!token) return;

    const prev = destinations;
    setDestinations((p) => p.filter((d) => d.id !== destId));

    try {
      await api.removeDestination(aliasId, destId, token);
      onToast("Destination removed", "success");
    } catch {
      setDestinations(prev);
      onToast("Failed to remove destination", "error");
    }
  };

  const handleToggle = async (destId: string, currentActive: boolean) => {
    const token = getToken();
    if (!token) return;

    const newActive = !currentActive;
    setDestinations((prev) =>
      prev.map((d) => (d.id === destId ? { ...d, active: newActive } : d))
    );

    try {
      await api.toggleDestination(aliasId, destId, newActive, token);
    } catch {
      setDestinations((prev) =>
        prev.map((d) => (d.id === destId ? { ...d, active: currentActive } : d))
      );
      onToast("Failed to update destination", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-8 rounded-2xl w-full max-w-lg z-10 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--relay-text)]">Forwarding Destinations</h2>
          <button onClick={onClose} className="text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] text-xl">✕</button>
        </div>

        <p className="text-sm text-[var(--relay-text-muted)] mb-4">
          Manage where <code className="text-[var(--relay-primary)]">{aliasAddress}</code> forwards to. Add multiple inboxes for team use cases.
        </p>

        {/* Default destination */}
        <div className="mb-4 p-3 bg-[var(--relay-bg)] rounded-xl border border-[var(--relay-border)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-[var(--relay-text)]">{primaryEmail}</span>
              <span className="text-xs text-[var(--relay-text-dim)] ml-2">(primary)</span>
            </div>
            <span className="text-xs text-[var(--relay-success)] font-medium">Always active</span>
          </div>
        </div>

        {/* Additional destinations */}
        {loading ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {destinations.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {destinations.map((dest) => (
                  <div key={dest.id} className={`p-3 bg-[var(--relay-bg)] rounded-xl border border-[var(--relay-border)] ${!dest.active ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--relay-text)] truncate flex-1">{dest.email}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dest.active}
                            onChange={() => handleToggle(dest.id, dest.active)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-[var(--relay-border)] rounded-full peer peer-checked:bg-[var(--relay-success)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 after:shadow-sm"></div>
                        </label>
                        <button
                          onClick={() => handleRemove(dest.id)}
                          className="text-xs text-[var(--relay-danger)] hover:text-white hover:bg-[var(--relay-danger)] border border-[var(--relay-danger)]/20 px-2 py-1 rounded-lg transition-smooth"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add destination */}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Add email destination..."
                className="flex-1 px-3 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] transition-smooth placeholder:text-[var(--relay-text-dim)]"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!newEmail || adding}
                className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-medium px-4 py-2.5 rounded-lg transition-smooth disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {adding ? "..." : "+ Add"}
              </button>
            </div>
            <span className="text-xs text-[var(--relay-text-dim)] mt-1.5 block">
              Up to 5 destinations per alias. Great for teams and shared inboxes.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
