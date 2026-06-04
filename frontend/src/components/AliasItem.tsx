"use client";

import { useState } from "react";
import { Alias } from "@/lib/types";
import BlocklistPanel from "./BlocklistPanel";

interface AliasItemProps {
  alias: Alias;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (address: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onManageDestinations: (id: string, address: string) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

const CATEGORIES = [
  { value: "", label: "None", emoji: "", color: "" },
  { value: "shopping", label: "Shopping", emoji: "🛒", color: "text-emerald-400 bg-emerald-400/8 border-emerald-400/20" },
  { value: "social", label: "Social", emoji: "💬", color: "text-blue-400 bg-blue-400/8 border-blue-400/20" },
  { value: "finance", label: "Finance", emoji: "💰", color: "text-amber-400 bg-amber-400/8 border-amber-400/20" },
  { value: "work", label: "Work", emoji: "💼", color: "text-purple-400 bg-purple-400/8 border-purple-400/20" },
  { value: "travel", label: "Travel", emoji: "✈️", color: "text-cyan-400 bg-cyan-400/8 border-cyan-400/20" },
  { value: "other", label: "Other", emoji: "📁", color: "text-gray-400 bg-gray-400/8 border-gray-400/20" },
];

function getCategoryBadge(category: string) {
  const cat = CATEGORIES.find((c) => c.value === category);
  if (!cat || !cat.value) return null;
  return cat;
}

export default function AliasItem({ alias, onToggle, onDelete, onCopy, onUpdateNotes, onUpdateCategory, onManageDestinations, onToast }: AliasItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBlocklist, setShowBlocklist] = useState(false);
  const [notesValue, setNotesValue] = useState(alias.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = new Date(alias.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSaveNotes = () => {
    setIsSaving(true);
    onUpdateNotes(alias.id, notesValue);
    setTimeout(() => setIsSaving(false), 300);
  };

  const categoryBadge = getCategoryBadge(alias.category);

  return (
    <>
      <div
        className={`glass-card px-4 sm:px-6 py-4 sm:py-5 rounded-xl transition-smooth ${
          !alias.active ? "opacity-40" : ""
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-mono text-[var(--relay-primary)] text-sm sm:text-base truncate font-medium max-w-full">
                {alias.address}
              </div>
              {categoryBadge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryBadge.color}`}>
                  {categoryBadge.emoji} {categoryBadge.label}
                </span>
              )}
              {alias.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--relay-success)] shrink-0"></span>
              )}
            </div>
            <div className="text-[var(--relay-text-muted)] text-xs sm:text-sm mt-1">
              {alias.label || "Unlabeled alias"}
            </div>
            <div className="text-[var(--relay-text-dim)] text-xs mt-1.5 flex items-center gap-2 flex-wrap">
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--relay-border)]"></span>
              <span>{alias.forwarded} forwarded</span>
              {alias.isTemporary && alias.expiresAt && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--relay-border)]"></span>
                  <span className="text-[var(--relay-warning)]">
                    Expires {new Date(alias.expiresAt).toLocaleDateString()}
                  </span>
                </>
              )}
              {alias.isTemporary && alias.maxEmails && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--relay-border)]"></span>
                  <span className="text-[var(--relay-warning)]">
                    {Math.max(0, alias.maxEmails - alias.forwarded)} left
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--relay-border)]">
            {/* Category picker */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className={`text-sm border px-3 py-2 rounded-md transition-smooth font-medium ${
                  alias.category
                    ? "border-[var(--relay-primary)]/20 text-[var(--relay-primary)] bg-[var(--relay-primary)]/5"
                    : "border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)]"
                }`}
                title="Set category"
              >
                {alias.category ? (getCategoryBadge(alias.category)?.emoji || "🏷️") : "🏷️"}
              </button>
              {showCategoryPicker && (
                <div className="absolute top-full right-0 mt-1 z-20 bg-[var(--relay-card)] border border-[var(--relay-border)] rounded-lg shadow-xl p-1.5 min-w-[140px]">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        onUpdateCategory(alias.id, cat.value);
                        setShowCategoryPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-smooth hover:bg-[var(--relay-card-hover)] ${
                        alias.category === cat.value ? "text-[var(--relay-primary)]" : "text-[var(--relay-text-muted)]"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blocklist button */}
            <button
              onClick={() => setShowBlocklist(true)}
              className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-danger)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-danger)] px-3 py-2 rounded-md transition-smooth font-medium"
              title="Manage blocked senders"
            >
              🚫
            </button>

            {/* Notes toggle */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`text-sm border px-3 py-2 rounded-md transition-smooth font-medium ${
                showNotes || alias.notes
                  ? "border-[var(--relay-primary)]/20 text-[var(--relay-primary)] bg-[var(--relay-primary)]/5"
                  : "border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)]"
              }`}
              title={alias.notes ? "View/edit notes" : "Add notes"}
            >
              {alias.notes ? "📝" : "+ Note"}
            </button>

            {/* Destinations button */}
            <button
              onClick={() => onManageDestinations(alias.id, alias.address)}
              className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] px-3 py-2 rounded-md transition-smooth font-medium"
              title="Manage forwarding destinations"
            >
              📨
            </button>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer" title={alias.active ? "Disable" : "Enable"}>
              <input
                type="checkbox"
                checked={alias.active}
                onChange={() => onToggle(alias.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--relay-border)] rounded-full peer peer-checked:bg-[var(--relay-primary)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5 after:shadow-sm"></div>
            </label>

            {/* Copy Button */}
            <button
              onClick={() => onCopy(alias.address)}
              className="text-sm border border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] px-3 py-2 rounded-md transition-smooth font-medium"
              title="Copy address"
            >
              Copy
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(alias.id)}
              className="text-sm border border-[var(--relay-danger)]/15 hover:bg-[var(--relay-danger)] text-[var(--relay-danger)] hover:text-white px-3 py-2 rounded-md transition-smooth font-medium"
              title="Delete alias"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="mt-4 pt-3 border-t border-[var(--relay-border)]">
            <label className="block text-[10px] font-semibold text-[var(--relay-text-dim)] mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="e.g. Signed up for Spotify trial, newsletter from TechCrunch..."
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)] resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-[var(--relay-text-dim)]">
                {notesValue.length}/500
              </span>
              {isSaving && (
                <span className="text-[10px] text-[var(--relay-success)] font-medium">Saved</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Blocklist Panel */}
      {showBlocklist && (
        <BlocklistPanel
          aliasId={alias.id}
          aliasAddress={alias.address}
          onClose={() => setShowBlocklist(false)}
          onToast={onToast}
        />
      )}
    </>
  );
}
