import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-slate-700">
      <Link href="/" className="text-xl font-bold text-slate-100">
        <span className="text-2xl mr-1">✉</span> EmailAlias
      </Link>
      <div className="flex items-center gap-6">
        <a href="#features" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
          How It Works
        </a>
        <a href="#pricing" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
          Pricing
        </a>
        <Link
          href="/dashboard"
          className="text-sm border border-slate-600 hover:border-indigo-500 text-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Sign Up Free
        </Link>
      </div>
    </nav>
  );
}
