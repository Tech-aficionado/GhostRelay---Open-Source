"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--relay-border)] bg-[var(--relay-bg)]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 lg:px-16 py-3.5">
        <Link href="/" className="flex items-center">
          <Logo size={30} showText={true} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/#features" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-[var(--relay-card-hover)]">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-[var(--relay-card-hover)]">
            How It Works
          </Link>
          <Link href="/about" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-[var(--relay-card-hover)]">
            About
          </Link>
          <Link href="/blog" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-[var(--relay-card-hover)]">
            Blog
          </Link>
          <Link href="/contact" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-[var(--relay-card-hover)]">
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-5 py-2.5 rounded-lg transition-smooth btn-glow"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[var(--relay-text)] p-2 rounded-lg hover:bg-[var(--relay-card-hover)] transition-smooth"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--relay-surface)] border-b border-[var(--relay-border)] px-6 pb-6 pt-2 animate-fade-up">
          <div className="flex flex-col gap-1">
            <Link href="/#features" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--relay-card-hover)]" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--relay-card-hover)]" onClick={() => setMobileOpen(false)}>How It Works</Link>
            <Link href="/about" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--relay-card-hover)]" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/blog" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--relay-card-hover)]" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link href="/contact" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--relay-card-hover)]" onClick={() => setMobileOpen(false)}>Contact</Link>
            <div className="mt-3 pt-3 border-t border-[var(--relay-border)]">
              <Link href="/dashboard" className="block text-sm bg-[var(--relay-primary)] text-white font-semibold px-5 py-2.5 rounded-lg text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
