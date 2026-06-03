import Link from "next/link";

interface DashboardNavProps {
  email: string;
  onLogout: () => void;
}

export default function DashboardNav({ email, onLogout }: DashboardNavProps) {
  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-[#2a3563] sticky top-0 bg-[#0a0e1a]/95 backdrop-blur-sm z-50">
      <Link href="/" className="text-xl font-bold text-[#e8eaf6] flex items-center gap-2">
        <span className="text-2xl">👻</span> GhostRelay
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#8892b0]">{email}</span>
        <button
          onClick={onLogout}
          className="text-sm border border-[#2a3563] hover:border-[#f43f5e] text-[#8892b0] hover:text-[#f43f5e] px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
