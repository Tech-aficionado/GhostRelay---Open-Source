"use client";

import { useState, useCallback } from "react";

interface CreateAliasModalProps {
  domain: string;
  onCreate: (label: string) => void;
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

export default function CreateAliasModal({
  domain,
  onCreate,
  onClose,
}: CreateAliasModalProps) {
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState(`${generateRandomAlias()}@${domain}`);

  const regenerate = useCallback(() => {
    setPreview(`${generateRandomAlias()}@${domain}`);
  }, [domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(label);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#12182b] p-9 rounded-xl border border-[#2a3563] w-full max-w-md z-10 shadow-[0_0_60px_rgba(124,58,237,0.15)]">
        <h2 className="text-xl font-bold mb-2 text-[#e8eaf6]">Summon New Ghost</h2>
        <p className="text-sm text-[#8892b0] mb-6">Conjure a new phantom alias for your collection.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="aliasLabel"
              className="block text-sm font-semibold text-[#8892b0] mb-1.5"
            >
              Label (optional)
            </label>
            <input
              type="text"
              id="aliasLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Shopping, Newsletter, Social Media"
              className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2a3563] rounded-lg text-[#e8eaf6] text-sm focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_10px_rgba(124,58,237,0.2)] transition-all"
            />
            <span className="text-xs text-[#5a6380] mt-1 block">
              A note to remember what this ghost is haunting.
            </span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#8892b0] mb-1.5">
              Ghost Alias Preview
            </label>
            <div className="flex items-center gap-3 bg-[#0a0e1a] px-4 py-3 rounded-lg border border-[#2a3563]">
              <span className="font-mono text-[#a78bfa] text-sm flex-1 truncate">
                {preview}
              </span>
              <button
                type="button"
                onClick={regenerate}
                className="text-xs border border-[#2a3563] hover:border-[#7c3aed] text-[#8892b0] hover:text-[#a78bfa] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                ↻ Re-conjure
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#2a3563] hover:border-[#5a6380] text-[#8892b0] font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Summon Ghost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
