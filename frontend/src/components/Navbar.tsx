import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-[#2a3563] bg-[#0a0e1a]/95 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-[#e8eaf6] flex items-center gap-2">
        <span className="text-2xl">👻</span> GhostRelay
      </Link>
      <div className="flex items-center gap-6">
        <a href="#features" className="text-sm text-[#8892b0] hover:text-[#a78bfa] transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="text-sm text-[#8892b0] hover:text-[#a78bfa] transition-colors">
          How It Works
        </a>
        <a href="#pricing" className="text-sm text-[#8892b0] hover:text-[#a78bfa] transition-colors">
          Pricing
        </a>
        <Link
          href="/dashboard"
          className="text-sm border border-[#2a3563] hover:border-[#7c3aed] text-[#e8eaf6] px-4 py-2 rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          Sign Up Free
        </Link>
      </div>
    </nav>
  );
}
