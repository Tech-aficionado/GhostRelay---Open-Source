import Link from "next/link";

interface DashboardNavProps {
  email: string;
  onLogout: () => void;
}

export default function DashboardNav({ email, onLogout }: DashboardNavProps) {
  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-slate-700 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
      <Link href="/" className="text-xl font-bold text-slate-100">
        <span className="text-2xl mr-1">✉</span> EmailAlias
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{email}</span>
        <button
          onClick={onLogout}
          className="text-sm border border-slate-600 hover:border-red-500 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
