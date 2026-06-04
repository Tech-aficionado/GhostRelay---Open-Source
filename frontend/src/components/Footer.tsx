import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--relay-border)] bg-[var(--relay-surface)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16">
        {/* Top section with accent line */}
        <div className="accent-line w-24 mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo size={28} showText={true} />
            <p className="text-[var(--relay-text-muted)] text-sm mt-4 leading-relaxed max-w-xs">
              Your real email stays invisible. Create aliases and take full control of your inbox privacy.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-[var(--relay-card-hover)] border border-[var(--relay-border)] flex items-center justify-center text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] hover:border-[var(--relay-primary)]/30 transition-smooth">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-lg bg-[var(--relay-card-hover)] border border-[var(--relay-border)] flex items-center justify-center text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] hover:border-[var(--relay-primary)]/30 transition-smooth">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" aria-label="Discord" className="w-9 h-9 rounded-lg bg-[var(--relay-card-hover)] border border-[var(--relay-border)] flex items-center justify-center text-[var(--relay-text-dim)] hover:text-[var(--relay-primary)] hover:border-[var(--relay-primary)]/30 transition-smooth">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-[var(--relay-text)] mb-5 text-sm tracking-wide uppercase text-xs">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Dashboard</Link></li>
              <li><Link href="/blog" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[var(--relay-text)] mb-5 text-sm tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Contact</Link></li>
              <li><a href="#" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[var(--relay-text)] mb-5 text-sm tracking-wide uppercase text-xs">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy#cookies" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/privacy#your-rights" className="text-sm text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors">GDPR</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--relay-border)] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--relay-text-dim)] text-xs">
            © {new Date().getFullYear()} GhostRelay. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-[var(--relay-text-dim)]">
              <span className="w-1.5 h-1.5 bg-[var(--relay-success)] rounded-full animate-pulse-soft"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
