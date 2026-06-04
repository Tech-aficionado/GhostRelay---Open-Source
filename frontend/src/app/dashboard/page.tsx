"use client";

import { useState, useEffect, useCallback } from "react";
import AliasItem from "@/components/AliasItem";
import CreateAliasModal from "@/components/CreateAliasModal";
import DestinationsPanel from "@/components/DestinationsPanel";
import Toast from "@/components/Toast";
import { useDashboard } from "@/lib/DashboardContext";
import {
  getToken,
  clearAuth,
} from "@/lib/auth";
import * as api from "@/lib/api";
import type { Alias } from "@/lib/types";

export type { Alias } from "@/lib/types";

const MAX_ALIASES = 20;
const DOMAIN = "ghostrelay.me";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateRandomAlias(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function DashboardPage() {
  const { user, isDemo, showToast } = useDashboard();
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [destinationsAlias, setDestinationsAlias] = useState<{ id: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const currentLimit = MAX_ALIASES;

  const forceReLogin = useCallback(() => {
    clearAuth();
    window.location.href = "/dashboard";
  }, []);

  // Load aliases when user is set
  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      const savedAliases = localStorage.getItem("ghostrelay_aliases_" + user.email);
      if (savedAliases) {
        setAliases(JSON.parse(savedAliases));
      }
      setLoading(false);
    } else {
      const token = getToken();
      if (token) {
        api
          .listAliases(token)
          .then((data) => {
            setAliases(data.aliases);
          })
          .catch((err) => {
            if (err instanceof api.ApiError && err.status === 401) {
              forceReLogin();
              return;
            }
            console.warn("API fetch failed, falling back to local:", err);
            const savedAliases = localStorage.getItem("ghostrelay_aliases_" + user.email);
            if (savedAliases) {
              setAliases(JSON.parse(savedAliases));
            }
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [user, isDemo, forceReLogin]);

  // Save aliases to localStorage
  useEffect(() => {
    if (user && aliases.length >= 0) {
      localStorage.setItem(
        "ghostrelay_aliases_" + user.email,
        JSON.stringify(aliases)
      );
    }
  }, [aliases, user]);

  const handleCreateAlias = async (label: string, customAlias?: string, notes?: string, category?: string, expiresInDays?: number, maxEmails?: number) => {
    if (aliases.length >= currentLimit) {
      showToast(`Maximum limit reached (${currentLimit} aliases).`, "error");
      return;
    }
    await createAliasDirectly(label, customAlias, notes, category, expiresInDays, maxEmails);
  };

  const createAliasDirectly = async (label: string, customAlias?: string, notes?: string, category?: string, expiresInDays?: number, maxEmails?: number) => {
    if (!isDemo) {
      const token = getToken();
      if (token) {
        try {
          const data = await api.createAlias(label, token, customAlias, notes, category, expiresInDays, maxEmails);
          setAliases((prev) => [data.alias, ...prev]);
          setShowCreateModal(false);
          showToast(`Alias created: ${data.alias.address}`, "success");
          return;
        } catch (err) {
          if (err instanceof api.ApiError) {
            if (err.status === 401) {
              forceReLogin();
              return;
            }
            showToast(err.message, "error");
          } else {
            showToast("Failed to create alias", "error");
          }
          return;
        }
      }
    }

    // Demo mode fallback
    const address = customAlias
      ? `${customAlias}@${DOMAIN}`
      : `${generateRandomAlias()}@${DOMAIN}`;
    const newAlias: Alias = {
      id: generateId(),
      address,
      label,
      notes: notes || "",
      category: category || "",
      active: true,
      forwarded: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null,
      maxEmails: maxEmails || null,
      isTemporary: Boolean(expiresInDays || maxEmails),
    };

    setAliases((prev) => [newAlias, ...prev]);
    setShowCreateModal(false);
    showToast(`Alias created: ${address}`, "success");
  };

  const handleToggleAlias = async (id: string) => {
    const alias = aliases.find((a) => a.id === id);
    if (!alias) return;

    const newActive = !alias.active;
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: newActive } : a))
    );

    if (!isDemo) {
      const token = getToken();
      if (token) {
        try {
          await api.toggleAlias(id, newActive, token);
        } catch {
          setAliases((prev) =>
            prev.map((a) => (a.id === id ? { ...a, active: !newActive } : a))
          );
          showToast("Failed to update alias", "error");
          return;
        }
      }
    }
    showToast(newActive ? "Alias enabled" : "Alias disabled", "success");
  };

  const handleDeleteAlias = async (id: string) => {
    if (!confirm("Delete this alias? Emails sent to it will no longer be forwarded.")) return;

    const prevAliases = aliases;
    setAliases((prev) => prev.filter((a) => a.id !== id));

    if (!isDemo) {
      const token = getToken();
      if (token) {
        try {
          await api.deleteAlias(id, token);
        } catch {
          setAliases(prevAliases);
          showToast("Failed to delete alias", "error");
          return;
        }
      }
    }
    showToast("Alias deleted", "success");
  };

  const handleCopyAlias = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => showToast("Copied to clipboard!", "success"))
      .catch(() => showToast("Failed to copy", "error"));
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes } : a))
    );
    if (!isDemo) {
      const token = getToken();
      if (token) {
        try {
          await api.updateAliasNotes(id, notes, token);
        } catch {
          showToast("Failed to save notes", "error");
        }
      }
    }
  };

  const handleUpdateCategory = async (id: string, category: string) => {
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, category } : a))
    );
    if (!isDemo) {
      const token = getToken();
      if (token) {
        try {
          await api.updateAliasCategory(id, category, token);
        } catch {
          showToast("Failed to update category", "error");
        }
      }
    }
  };

  const handleExportPDF = async () => {
    if (aliases.length === 0) {
      showToast("No aliases to export", "error");
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("GhostRelay - Aliases Export", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const headers = ["Address", "Label", "Notes", "Status", "Forwarded", "Created"];
    const rows = aliases.map((a) => [
      a.address,
      a.label,
      a.notes || "",
      a.active ? "Active" : "Inactive",
      String(a.forwarded),
      new Date(a.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 34,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`ghostrelay-aliases-${new Date().toISOString().split("T")[0]}.pdf`);
    showToast("Aliases exported as PDF", "success");
  };

  // Filter aliases
  const filteredAliases = aliases.filter((alias) => {
    const matchesSearch =
      !searchQuery ||
      alias.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alias.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alias.notes && alias.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && alias.active) ||
      (statusFilter === "inactive" && !alias.active);

    const matchesCategory =
      categoryFilter === "all" || alias.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = aliases.filter((a) => a.active).length;
  const totalForwarded = aliases.reduce((sum, a) => sum + a.forwarded, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--relay-text)] tracking-tight">Your Aliases</h1>
          <p className="text-[var(--relay-text-dim)] text-sm mt-1">
            {aliases.length} / {currentLimit} aliases created
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportPDF}
            className="border border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] font-medium px-4 py-2.5 rounded-lg transition-smooth text-sm"
            title="Export aliases as PDF"
          >
            ↓ Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-5 py-2.5 rounded-lg transition-smooth btn-glow text-sm"
          >
            + New Alias
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="glass-card p-3 sm:p-5 rounded-xl text-center">
          <div className="text-xl sm:text-3xl font-bold text-[var(--relay-primary)]">{aliases.length}</div>
          <div className="text-[10px] sm:text-xs text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Total</div>
        </div>
        <div className="glass-card p-3 sm:p-5 rounded-xl text-center">
          <div className="text-xl sm:text-3xl font-bold text-[var(--relay-success)]">{activeCount}</div>
          <div className="text-[10px] sm:text-xs text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Active</div>
        </div>
        <div className="glass-card p-3 sm:p-5 rounded-xl text-center">
          <div className="text-xl sm:text-3xl font-bold text-[var(--relay-accent)]">{totalForwarded}</div>
          <div className="text-[10px] sm:text-xs text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Forwarded</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--relay-text-dim)]"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search aliases..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
          />
        </div>
        <div className="flex gap-0.5 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-lg p-0.5 self-start">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-md text-sm font-medium transition-smooth ${
              statusFilter === "all"
                ? "bg-[var(--relay-primary)]/10 text-[var(--relay-primary)]"
                : "text-[var(--relay-text-dim)] hover:text-[var(--relay-text-muted)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-2 rounded-md text-sm font-medium transition-smooth ${
              statusFilter === "active"
                ? "bg-[var(--relay-success)]/10 text-[var(--relay-success)]"
                : "text-[var(--relay-text-dim)] hover:text-[var(--relay-text-muted)]"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3.5 py-2 rounded-md text-sm font-medium transition-smooth ${
              statusFilter === "inactive"
                ? "bg-[var(--relay-danger)]/10 text-[var(--relay-danger)]"
                : "text-[var(--relay-text-dim)] hover:text-[var(--relay-text-muted)]"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {[
          { value: "all", label: "All" },
          { value: "shopping", label: "🛒 Shopping" },
          { value: "social", label: "💬 Social" },
          { value: "finance", label: "💰 Finance" },
          { value: "work", label: "💼 Work" },
          { value: "travel", label: "✈️ Travel" },
          { value: "other", label: "📁 Other" },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-smooth border whitespace-nowrap flex-shrink-0 ${
              categoryFilter === cat.value
                ? "bg-[var(--relay-primary)]/8 border-[var(--relay-primary)]/20 text-[var(--relay-primary)]"
                : "border-[var(--relay-border)] text-[var(--relay-text-dim)] hover:text-[var(--relay-text-muted)] hover:border-[var(--relay-text-dim)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alias List */}
      <div className="flex flex-col gap-2.5">
        {aliases.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-xl">
            <div className="w-14 h-14 relay-gradient rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-5 shadow-lg shadow-teal-500/20 animate-float">
              G
            </div>
            <h3 className="text-[var(--relay-text)] font-semibold text-base mb-2">
              No aliases yet
            </h3>
            <p className="text-[var(--relay-text-muted)] text-sm mb-6 max-w-xs mx-auto">
              Create your first email alias to start protecting your privacy.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-5 py-2.5 rounded-lg transition-smooth btn-glow text-sm"
            >
              Create First Alias
            </button>
          </div>
        ) : filteredAliases.length === 0 ? (
          <div className="text-center py-14 glass-card rounded-xl">
            <p className="text-[var(--relay-text-muted)] text-sm">
              No aliases match your search or filter.
            </p>
          </div>
        ) : (
          filteredAliases.map((alias) => (
            <AliasItem
              key={alias.id}
              alias={alias}
              onToggle={handleToggleAlias}
              onDelete={handleDeleteAlias}
              onCopy={handleCopyAlias}
              onUpdateNotes={handleUpdateNotes}
              onUpdateCategory={handleUpdateCategory}
              onManageDestinations={(id, address) => setDestinationsAlias({ id, address })}
              onToast={showToast}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAliasModal
          domain={DOMAIN}
          onCreate={handleCreateAlias}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Destinations Panel (per-alias modal) */}
      {destinationsAlias && (
        <DestinationsPanel
          aliasId={destinationsAlias.id}
          aliasAddress={destinationsAlias.address}
          onClose={() => setDestinationsAlias(null)}
          onToast={showToast}
        />
      )}
    </div>
  );
}
