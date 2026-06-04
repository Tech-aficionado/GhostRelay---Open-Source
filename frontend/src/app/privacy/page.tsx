import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "GhostRelay Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="mesh-bg text-center px-6 pt-36 pb-16 max-w-4xl mx-auto">
        <div className="accent-line w-12 mx-auto mb-6"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-base text-[var(--relay-text-muted)] max-w-md mx-auto">
          Your privacy is our core product. Here&apos;s exactly how we handle your data.
        </p>
        <p className="text-xs text-[var(--relay-text-dim)] mt-4">
          Last updated: June 1, 2026
        </p>
      </section>

      {/* Content */}
      <section className="px-6 md:px-10 lg:px-16 py-16 max-w-3xl mx-auto">
        <div className="space-y-10">
          {/* Introduction */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">1. Introduction</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                GhostRelay (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the ghostrelay.me website and email forwarding service. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              <p>
                We are committed to protecting your privacy. Our business model is built on privacy — we have no incentive to collect or sell your data.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">2. Information We Collect</h2>
            <div className="space-y-4 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <div>
                <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Email address (for forwarding purposes)</li>
                  <li>Hashed password (we never store plaintext passwords)</li>
                  <li>Account creation date</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-2">Alias Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Alias addresses you create</li>
                  <li>Labels and notes you assign to aliases</li>
                  <li>Forwarding statistics (email count only — not content)</li>
                  <li>Active/inactive status</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--relay-text)] mb-2">What We Do NOT Collect</h3>
                <div className="glass-card p-4 rounded-xl border-[var(--relay-success)]/20">
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[var(--relay-success)]">
                    <li>We do NOT read or store email content</li>
                    <li>We do NOT log email sender/recipient metadata beyond delivery</li>
                    <li>We do NOT use tracking pixels or third-party analytics</li>
                    <li>We do NOT sell, rent, or share your data with anyone</li>
                    <li>We do NOT serve advertisements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">3. How We Use Your Information</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>We use the information we collect solely to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Forward emails from your aliases to your real email address</li>
                <li>Authenticate you when you log into your account</li>
                <li>Display forwarding statistics in your dashboard</li>
                <li>Send you critical service notifications (e.g., security alerts)</li>
                <li>Prevent abuse of our service (rate limiting, spam detection)</li>
              </ul>
            </div>
          </div>

          {/* Email Processing */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">4. Email Processing</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                When an email arrives at one of your aliases, we process it in real-time:
              </p>
              <div className="glass-card p-5 rounded-xl space-y-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md relay-gradient flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <p>Email arrives at alias address on our mail server</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md relay-gradient flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <p>We verify the alias is active and not blocked</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md relay-gradient flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <p>Email is immediately forwarded to your real address</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md relay-gradient flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">4</span>
                  <p>No copy is stored on our servers — the email passes through</p>
                </div>
              </div>
              <p>
                Emails are processed in-memory and are never written to disk or stored in any database. We operate as a pure relay — no email content is ever retained.
              </p>
            </div>
          </div>

          {/* Data Storage & Security */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">5. Data Storage & Security</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Passwords are hashed with bcrypt (cost factor 12)</li>
                <li>Authentication tokens are cryptographically signed JWTs</li>
                <li>Infrastructure runs on Cloudflare&apos;s global edge network</li>
                <li>Rate limiting protects against brute force attacks</li>
                <li>Regular security audits and penetration testing</li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">6. Data Retention</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                We retain your account data for as long as your account is active. When you delete your account:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>All aliases are immediately deactivated</li>
                <li>Your personal data is permanently deleted within 30 days</li>
                <li>Forwarding statistics are anonymized and aggregated</li>
                <li>Backups containing your data are purged within 90 days</li>
              </ul>
            </div>
          </div>

          {/* Third Parties */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">7. Third-Party Services</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>We use minimal third-party services:</p>
              <div className="glass-card p-4 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--relay-border)]">
                      <th className="text-left py-2 text-[var(--relay-text)] font-semibold">Service</th>
                      <th className="text-left py-2 text-[var(--relay-text)] font-semibold">Purpose</th>
                      <th className="text-left py-2 text-[var(--relay-text)] font-semibold">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--relay-border)]">
                    <tr>
                      <td className="py-2">Cloudflare</td>
                      <td className="py-2">Infrastructure & CDN</td>
                      <td className="py-2">IP addresses (for security)</td>
                    </tr>
                    <tr>
                      <td className="py-2">Neon (PostgreSQL)</td>
                      <td className="py-2">Database</td>
                      <td className="py-2">Account & alias data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                We do NOT use Google Analytics, Facebook Pixel, or any advertising trackers.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">8. Your Rights</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>Under GDPR and CCPA, you have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong className="text-[var(--relay-text)]">Access</strong> — Request a copy of all data we hold about you</li>
                <li><strong className="text-[var(--relay-text)]">Rectification</strong> — Correct any inaccurate personal data</li>
                <li><strong className="text-[var(--relay-text)]">Erasure</strong> — Request permanent deletion of your account and data</li>
                <li><strong className="text-[var(--relay-text)]">Portability</strong> — Export your data in machine-readable format (CSV)</li>
                <li><strong className="text-[var(--relay-text)]">Objection</strong> — Object to processing of your personal data</li>
                <li><strong className="text-[var(--relay-text)]">Restriction</strong> — Request limitation of processing</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at <a href="mailto:privacy@ghostrelay.me" className="text-[var(--relay-primary)] hover:underline">privacy@ghostrelay.me</a>. We respond within 30 days.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">9. Cookies</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>We use only essential cookies:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong className="text-[var(--relay-text)]">Authentication token</strong> — Keeps you logged in (localStorage)</li>
                <li><strong className="text-[var(--relay-text)]">Theme preference</strong> — Remembers your light/dark mode choice</li>
              </ul>
              <p>
                We do not use any tracking cookies, advertising cookies, or third-party cookies.
              </p>
            </div>
          </div>

          {/* Children */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">10. Children&apos;s Privacy</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                Our service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us data, contact us and we will delete it immediately.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">11. Changes to This Policy</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                We may update this policy from time to time. Significant changes will be communicated via email notification to registered users. The &quot;Last updated&quot; date at the top indicates when this policy was last revised.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">12. Contact Us</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>For privacy-related questions or concerns:</p>
              <div className="glass-card p-5 rounded-xl space-y-2">
                <p><strong className="text-[var(--relay-text)]">Email:</strong> <a href="mailto:privacy@ghostrelay.me" className="text-[var(--relay-primary)] hover:underline">privacy@ghostrelay.me</a></p>
                <p><strong className="text-[var(--relay-text)]">Response Time:</strong> Within 30 days</p>
                <p><strong className="text-[var(--relay-text)]">Data Protection Officer:</strong> Taylor Kim</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
