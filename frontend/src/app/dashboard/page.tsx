"use client";

import { useState, useEffect } from "react";
import DashboardNav from "@/components/DashboardNav";
import AuthForm from "@/components/AuthForm";
import AliasItem from "@/components/AliasItem";
import CreateAliasModal from "@/components/CreateAliasModal";
import Toast from "@/components/Toast";

export interface Alias {
  id: string;
  address: string;
  label: string;
  active: boolean;
  forwarded: number;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

const DOMAIN = "ghostrelay.io";
const MAX_FREE_ALIASES = 5;

function generateRandomAlias(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load user and aliases from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ghostrelay_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const savedAliases = localStorage.getItem(
        "ghostrelay_aliases_" + parsedUser.email
      );
      if (savedAliases) {
        setAliases(JSON.parse(savedAliases));
      }
    }
  }, []);

  // Save aliases whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "ghostrelay_aliases_" + user.email,
        JSON.stringify(aliases)
      );
    }
  }, [aliases, user]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleLogin = (email: string) => {
    const newUser = { id: generateId(), email };
    setUser(newUser);
    localStorage.setItem("ghostrelay_user", JSON.stringify(newUser));

    // Load existing aliases for this user
    const savedAliases = localStorage.getItem("ghostrelay_aliases_" + email);
    if (savedAliases) {
      setAliases(JSON.parse(savedAliases));
    } else {
      setAliases([]);
    }

    showToast("Welcome to GhostRelay! 👻", "success");
  };

  const handleLogout = () => {
    setUser(null);
    setAliases([]);
    localStorage.removeItem("ghostrelay_user");
    localStorage.removeItem("ghostrelay_token");
  };

  const handleCreateAlias = (label: string) => {
    if (aliases.length >= MAX_FREE_ALIASES) {
      showToast(
        `Ghost limit reached (${MAX_FREE_ALIASES}). Upgrade to Poltergeist for unlimited!`,
        "error"
      );
      return;
    }

    const address = `${generateRandomAlias()}@${DOMAIN}`;
    const newAlias: Alias = {
      id: generateId(),
      address,
      label,
      active: true,
      forwarded: 0,
      createdAt: new Date().toISOString(),
    };

    setAliases((prev) => [newAlias, ...prev]);
    setShowCreateModal(false);
    showToast(`Ghost summoned: ${address}`, "success");
  };

  const handleToggleAlias = (id: string) => {
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    const alias = aliases.find((a) => a.id === id);
    showToast(
      alias?.active ? "Ghost vanished (disabled)" : "Ghost reawakened (enabled)",
      "success"
    );
  };

  const handleDeleteAlias = (id: string) => {
    if (!confirm("Banish this ghost? Emails sent to it will no longer be forwarded.")) {
      return;
    }
    setAliases((prev) => prev.filter((a) => a.id !== id));
    showToast("Ghost banished forever", "success");
  };

  const handleCopyAlias = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      showToast("Copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy", "error");
    });
  };

  // Not logged in — show auth form
  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Logged in — show dashboard
  const activeCount = aliases.filter((a) => a.active).length;
  const totalForwarded = aliases.reduce((sum, a) => sum + a.forwarded, 0);

  return (
    <div className="min-h-screen">
      <DashboardNav email={user.email} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#e8eaf6]">Your Ghosts</h1>
            <p className="text-[#8892b0] text-sm mt-1">
              {aliases.length} / {MAX_FREE_ALIASES} phantoms summoned
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            + Summon Ghost
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12182b] p-6 rounded-xl border border-[#2a3563] text-center">
            <div className="text-3xl font-bold text-[#a78bfa]">{aliases.length}</div>
            <div className="text-sm text-[#8892b0] mt-1">Total Ghosts</div>
          </div>
          <div className="bg-[#12182b] p-6 rounded-xl border border-[#2a3563] text-center">
            <div className="text-3xl font-bold text-[#06d6a0]">{activeCount}</div>
            <div className="text-sm text-[#8892b0] mt-1">Active</div>
          </div>
          <div className="bg-[#12182b] p-6 rounded-xl border border-[#2a3563] text-center">
            <div className="text-3xl font-bold text-[#a78bfa]">{totalForwarded}</div>
            <div className="text-sm text-[#8892b0] mt-1">Emails Relayed</div>
          </div>
        </div>

        {/* Alias List */}
        <div className="flex flex-col gap-3">
          {aliases.length === 0 ? (
            <div className="text-center py-16 text-[#8892b0]">
              <div className="text-6xl mb-4 animate-float">👻</div>
              <h3 className="text-[#e8eaf6] font-semibold text-lg mb-2">
                No ghosts yet
              </h3>
              <p className="mb-6">
                Summon your first ghost alias to start protecting your privacy.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                Summon First Ghost
              </button>
            </div>
          ) : (
            aliases.map((alias) => (
              <AliasItem
                key={alias.id}
                alias={alias}
                onToggle={handleToggleAlias}
                onDelete={handleDeleteAlias}
                onCopy={handleCopyAlias}
              />
            ))
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAliasModal
          domain={DOMAIN}
          onCreate={handleCreateAlias}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
}
