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
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-800 p-9 rounded-xl border border-slate-700 w-full max-w-md z-10">
        <h2 className="text-xl font-bold mb-6">Create New Alias</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="aliasLabel"
              className="block text-sm font-semibold text-slate-400 mb-1.5"
            >
              Label (optional)
            </label>
            <input
              type="text"
              id="aliasLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Shopping, Newsletter, Social Media"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-xs text-slate-500 mt-1 block">
              A note to help you remember what this alias is for.
            </span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-400 mb-1.5">
              Generated Alias Preview
            </label>
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-lg border border-slate-700">
              <span className="font-mono text-indigo-300 text-sm flex-1 truncate">
                {preview}
              </span>
              <button
                type="button"
                onClick={regenerate}
                className="text-xs border border-slate-600 hover:border-indigo-500 text-slate-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                ↻ Regenerate
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-600 hover:border-slate-500 text-slate-300 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Create Alias
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
