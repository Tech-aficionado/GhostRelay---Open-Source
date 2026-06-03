"use client";

import { Alias } from "@/app/dashboard/page";

interface AliasItemProps {
  alias: Alias;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (address: string) => void;
}

export default function AliasItem({ alias, onToggle, onDelete, onCopy }: AliasItemProps) {
  const formattedDate = new Date(alias.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`bg-slate-800 px-6 py-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-indigo-500 ${
        !alias.active ? "opacity-50" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-mono text-indigo-300 text-sm truncate">
          {alias.address}
        </div>
        <div className="text-slate-400 text-sm mt-0.5">
          {alias.label || "No label"}
        </div>
        <div className="text-slate-500 text-xs mt-1">
          Created {formattedDate} • {alias.forwarded} emails forwarded
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer" title={alias.active ? "Disable" : "Enable"}>
          <input
            type="checkbox"
            checked={alias.active}
            onChange={() => onToggle(alias.id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
        </label>

        {/* Copy Button */}
        <button
          onClick={() => onCopy(alias.address)}
          className="text-xs border border-slate-600 hover:border-indigo-500 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          title="Copy"
        >
          📋
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(alias.id)}
          className="text-xs bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
