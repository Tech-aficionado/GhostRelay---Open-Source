"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";
import * as api from "@/lib/api";

interface CreateAliasModalProps {
  domain: string;
  onCreate: (label: string, customAlias?: string, notes?: string, category?: string, expiresInDays?: number, maxEmails?: number) => void;
  onClose: () => void;
}

function generateRandomAlias(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Only allow lowercase letters, numbers, dots, hyphens, and underscores
const CUSTOM_ALIAS_REGEX = /^[a-z0-9._-]+$/;
const MIN_CUSTOM_ALIAS_LENGTH = 3;
const MAX_CUSTOM_ALIAS_LENGTH = 30;

const CATEGORIES = [
  { value: "", label: "None" },
  { value: "shopping", label: "🛒 Shopping" },
  { value: "social", label: "💬 Social" },
  { value: "finance", label: "💰 Finance" },
  { value: "work", label: "💼 Work" },
  { value: "travel", label: "✈️ Travel" },
  { value: "other", label: "📁 Other" },
];

export default function CreateAliasModal({
  domain,
  onCreate,
  onClose,
}: CreateAliasModalProps) {
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [customAlias, setCustomAlias] = useState("");
  const [customError, setCustomError] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [randomPreview, setRandomPreview] = useState(generateRandomAlias());
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const regenerate = useCallback(() => {
    setRandomPreview(generateRandomAlias());
  }, []);

  const validateCustomAlias = (value: string): string => {
    if (!value) return "";
    if (value.length < MIN_CUSTOM_ALIAS_LENGTH) {
      return `Must be at least ${MIN_CUSTOM_ALIAS_LENGTH} characters`;
    }
    if (value.length > MAX_CUSTOM_ALIAS_LENGTH) {
      return `Must be ${MAX_CUSTOM_ALIAS_LENGTH} characters or less`;
    }
    if (!CUSTOM_ALIAS_REGEX.test(value)) {
      return "Only lowercase letters, numbers, dots, hyphens, and underscores allowed";
    }
    if (value.startsWith(".") || value.startsWith("-") || value.startsWith("_")) {
      return "Cannot start with a dot, hyphen, or underscore";
    }
    if (value.endsWith(".") || value.endsWith("-") || value.endsWith("_")) {
      return "Cannot end with a dot, hyphen, or underscore";
    }
    return "";
  };

  // Debounced availability check
  const checkAvailability = useCallback(async (alias: string) => {
    const token = getToken();
    if (!token || alias.length < MIN_CUSTOM_ALIAS_LENGTH) {
      setAvailabilityStatus("idle");
      return;
    }

    const error = validateCustomAlias(alias);
    if (error) {
      setAvailabilityStatus("idle");
      return;
    }

    setAvailabilityStatus("checking");
    try {
      const result = await api.checkAliasAvailability(alias, token);
      if (result.available) {
        setAvailabilityStatus("available");
      } else {
        setAvailabilityStatus("taken");
        setCustomError(result.reason || "Already taken");
      }
    } catch {
      setAvailabilityStatus("idle");
    }
  }, []);

  const handleCustomAliasChange = (value: string) => {
    const normalized = value.toLowerCase().trim();
    setCustomAlias(normalized);
    const error = validateCustomAlias(normalized);
    setCustomError(error);
    setAvailabilityStatus("idle");

    // Debounce availability check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!error && normalized.length >= MIN_CUSTOM_ALIAS_LENGTH) {
      checkTimeoutRef.current = setTimeout(() => {
        checkAvailability(normalized);
      }, 500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");
  const [maxEmails, setMaxEmails] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expDays = isTemporary && expiresInDays ? Number(expiresInDays) : undefined;
    const maxE = isTemporary && maxEmails ? Number(maxEmails) : undefined;

    if (useCustom) {
      const error = validateCustomAlias(customAlias);
      if (error) {
        setCustomError(error);
        return;
      }
      if (availabilityStatus === "taken") return;
      onCreate(label, customAlias, notes || undefined, category || undefined, expDays, maxE);
    } else {
      onCreate(label, undefined, notes || undefined, category || undefined, expDays, maxE);
    }
  };

  const previewAddress = useCustom
    ? `${customAlias || "your-alias"}@${domain}`
    : `${randomPreview}@${domain}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative glass-card p-5 sm:p-7 rounded-t-2xl sm:rounded-xl w-full max-w-md z-10 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Drag handle for mobile */}
        <div className="sm:hidden w-10 h-1 bg-[var(--relay-border)] rounded-full mx-auto mb-4"></div>
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] relay-gradient rounded-t-2xl sm:rounded-t-xl"></div>

        <h2 className="text-lg font-bold mb-1 text-[var(--relay-text)]">Create New Alias</h2>
        <p className="text-xs text-[var(--relay-text-muted)] mb-6">Generate a new email alias for your collection.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="aliasLabel"
              className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5"
            >
              Label (optional)
            </label>
            <input
              type="text"
              id="aliasLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Shopping, Newsletter, Social Media"
              className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">
              Category (optional)
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-smooth border ${
                    category === cat.value
                      ? "bg-[var(--relay-primary)]/10 border-[var(--relay-primary)]/30 text-[var(--relay-primary)]"
                      : "border-[var(--relay-border)] text-[var(--relay-text-muted)] hover:border-[var(--relay-text-dim)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes/Description */}
          <div className="mb-4">
            <label
              htmlFor="aliasNotes"
              className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5"
            >
              Description (optional)
            </label>
            <textarea
              id="aliasNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Signed up for Spotify trial, used for job applications..."
              maxLength={500}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)] resize-none"
            />
          </div>

          {/* Alias type toggle */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">
              Alias Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-medium transition-smooth border ${
                  !useCustom
                    ? "bg-[var(--relay-primary)]/10 border-[var(--relay-primary)]/30 text-[var(--relay-primary)]"
                    : "border-[var(--relay-border)] text-[var(--relay-text-muted)] hover:border-[var(--relay-text-dim)]"
                }`}
              >
                Random
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-medium transition-smooth border ${
                  useCustom
                    ? "bg-[var(--relay-primary)]/10 border-[var(--relay-primary)]/30 text-[var(--relay-primary)]"
                    : "border-[var(--relay-border)] text-[var(--relay-text-muted)] hover:border-[var(--relay-text-dim)]"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom alias input */}
          {useCustom ? (
            <div className="mb-4">
              <label
                htmlFor="customAlias"
                className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5"
              >
                Custom Alias
              </label>
              <div className={`flex items-center gap-0 bg-[var(--relay-bg)] border rounded-lg overflow-hidden focus-within:ring-2 transition-smooth ${
                availabilityStatus === "available"
                  ? "border-[var(--relay-success)] focus-within:ring-[var(--relay-success)]/10"
                  : availabilityStatus === "taken" || customError
                  ? "border-[var(--relay-danger)] focus-within:ring-[var(--relay-danger)]/10"
                  : "border-[var(--relay-border)] focus-within:border-[var(--relay-primary)] focus-within:ring-[var(--relay-primary)]/10"
              }`}>
                <input
                  type="text"
                  id="customAlias"
                  value={customAlias}
                  onChange={(e) => handleCustomAliasChange(e.target.value)}
                  placeholder="your-custom-alias"
                  className="flex-1 px-3.5 py-2.5 bg-transparent text-[var(--relay-text)] text-sm focus:outline-none placeholder:text-[var(--relay-text-dim)]"
                  maxLength={MAX_CUSTOM_ALIAS_LENGTH}
                  autoComplete="off"
                />
                <div className="pr-3.5 flex items-center gap-2">
                  {availabilityStatus === "checking" && (
                    <div className="w-3.5 h-3.5 border-2 border-[var(--relay-primary)] border-t-transparent rounded-full animate-spin" />
                  )}
                  {availabilityStatus === "available" && (
                    <span className="text-[var(--relay-success)] text-xs">✓</span>
                  )}
                  {availabilityStatus === "taken" && (
                    <span className="text-[var(--relay-danger)] text-xs">✗</span>
                  )}
                  <span className="text-xs text-[var(--relay-text-dim)] whitespace-nowrap">
                    @{domain}
                  </span>
                </div>
              </div>
              {customError && (
                <span className="text-[10px] text-[var(--relay-danger)] mt-1 block">
                  {customError}
                </span>
              )}
              {availabilityStatus === "available" && !customError && (
                <span className="text-[10px] text-[var(--relay-success)] mt-1 block">
                  ✓ This alias is available
                </span>
              )}
              <span className="text-[10px] text-[var(--relay-text-dim)] mt-1 block">
                3–30 characters. Letters, numbers, dots, hyphens, underscores.
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">
                Generated Alias
              </label>
              <div className="flex items-center gap-3 bg-[var(--relay-bg)] px-3.5 py-2.5 rounded-lg border border-[var(--relay-border)]">
                <span className="font-mono text-[var(--relay-primary)] text-sm flex-1 truncate font-medium">
                  {`${randomPreview}@${domain}`}
                </span>
                <button
                  type="button"
                  onClick={regenerate}
                  className="text-[10px] border border-[var(--relay-border)] hover:border-[var(--relay-primary)]/30 text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] px-2.5 py-1 rounded-md transition-smooth whitespace-nowrap font-medium"
                >
                  ↻ New
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">
              Preview
            </label>
            <div className="bg-[var(--relay-bg)] px-3.5 py-2.5 rounded-lg border border-[var(--relay-border)]">
              <span className="font-mono text-[var(--relay-primary)] text-sm font-medium">
                {previewAddress}
              </span>
            </div>
          </div>

          {/* Temporary/Expiring Alias */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTemporary}
                  onChange={(e) => setIsTemporary(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-[var(--relay-border)] rounded-full peer peer-checked:bg-[var(--relay-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5 after:shadow-sm"></div>
              </label>
              <span className="text-xs font-medium text-[var(--relay-text-muted)]">
                Temporary alias
              </span>
            </div>
            {isTemporary && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] text-[var(--relay-text-dim)] mb-1 font-medium">Expires after (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] transition-smooth placeholder:text-[var(--relay-text-dim)]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[var(--relay-text-dim)] mb-1 font-medium">Max emails</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxEmails}
                    onChange={(e) => setMaxEmails(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] transition-smooth placeholder:text-[var(--relay-text-dim)]"
                  />
                </div>
              </div>
            )}
            {isTemporary && (
              <span className="text-[10px] text-[var(--relay-text-dim)] mt-1.5 block">
                Alias will auto-disable when either limit is reached.
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto border border-[var(--relay-border)] hover:border-[var(--relay-text-dim)] text-[var(--relay-text-muted)] font-medium px-4 py-3 sm:py-2.5 rounded-lg transition-smooth text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={useCustom && (!!customError || !customAlias || availabilityStatus === "taken" || availabilityStatus === "checking")}
              className="w-full sm:w-auto bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-5 py-3 sm:py-2.5 rounded-lg transition-smooth btn-glow disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Create Alias
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
