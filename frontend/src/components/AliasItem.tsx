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
      className={`bg-[#12182b] px-6 py-5 rounded-xl border border-[#2a3563] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#7c3aed] hover:shadow-[0_0_15px_rgba(124,58,237,0.1)] ${
        !alias.active ? "opacity-40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[#a78bfa] text-sm truncate">
          👻 {alias.address}
        </div>
        <div className="text-[#8892b0] text-sm mt-0.5">
          {alias.label || "Unnamed ghost"}
        </div>
        <div className="text-[#5a6380] text-xs mt-1">
          Summoned {formattedDate} • {alias.forwarded} emails relayed
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer" title={alias.active ? "Vanish" : "Reawaken"}>
          <input
            type="checkbox"
            checked={alias.active}
            onChange={() => onToggle(alias.id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#2a3563] rounded-full peer peer-checked:bg-[#06d6a0] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
        </label>

        {/* Copy Button */}
        <button
          onClick={() => onCopy(alias.address)}
          className="text-xs border border-[#2a3563] hover:border-[#7c3aed] text-[#8892b0] hover:text-[#a78bfa] px-3 py-1.5 rounded-lg transition-colors"
          title="Copy"
        >
          📋
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(alias.id)}
          className="text-xs bg-[#f43f5e]/10 hover:bg-[#f43f5e] border border-[#f43f5e]/30 text-[#f43f5e] hover:text-white px-3 py-1.5 rounded-lg transition-all"
          title="Banish"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
