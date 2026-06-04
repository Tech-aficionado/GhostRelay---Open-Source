import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "GhostRelay Terms of Service — the rules and guidelines for using our email alias service.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="mesh-bg text-center px-6 pt-36 pb-16 max-w-4xl mx-auto">
        <div className="accent-line w-12 mx-auto mb-6"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-base text-[var(--relay-text-muted)] max-w-md mx-auto">
          The rules of the road for using GhostRelay. Plain language, no legalese traps.
        </p>
        <p className="text-xs text-[var(--relay-text-dim)] mt-4">
          Last updated: June 1, 2026
        </p>
      </section>

      {/* Content */}
      <section className="px-6 md:px-10 lg:px-16 py-16 max-w-3xl mx-auto">
        <div className="space-y-10">
          {/* Acceptance */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                By creating an account or using GhostRelay, you agree to these Terms of Service. If you disagree with any part, you may not use our service.
              </p>
              <p>
                These terms apply to all users of the service, including visitors, registered users, and anyone who accesses the GhostRelay platform.
              </p>
            </div>
          </div>

          {/* Service Description */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">2. Service Description</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                GhostRelay provides email alias creation and forwarding services. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Create up to 20 email aliases per account</li>
                <li>Forward emails sent to aliases to your registered email address</li>
                <li>Enable, disable, or delete aliases at any time</li>
                <li>View forwarding statistics and manage alias settings</li>
              </ul>
              <p>
                The service is provided &quot;as-is&quot; on a best-effort basis. While we strive for 99.9% uptime, we cannot guarantee uninterrupted service.
              </p>
            </div>
          </div>

          {/* Account Responsibilities */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">3. Account Responsibilities</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>When you create an account, you agree to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Provide a valid email address that you own</li>
                <li>Use a strong, unique password (minimum 8 characters)</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activity under your account</li>
              </ul>
              <p>
                You must be at least 13 years old to use this service. If you are under 18, you confirm that a parent or guardian has reviewed these terms.
              </p>
            </div>
          </div>

          {/* Acceptable Use */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">4. Acceptable Use Policy</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>You may NOT use GhostRelay to:</p>
              <div className="glass-card p-4 rounded-xl border-[var(--relay-danger)]/20">
                <ul className="list-disc list-inside space-y-1.5 ml-2 text-[var(--relay-danger)]">
                  <li>Send spam, phishing, or unsolicited bulk email</li>
                  <li>Engage in fraud, impersonation, or deception</li>
                  <li>Distribute malware, viruses, or harmful content</li>
                  <li>Harass, threaten, or abuse other individuals</li>
                  <li>Violate any applicable law or regulation</li>
                  <li>Circumvent rate limits or abuse our infrastructure</li>
                  <li>Create aliases for illegal purposes</li>
                  <li>Attempt to reverse-engineer or hack our service</li>
                </ul>
              </div>
              <p>
                Violation of this policy may result in immediate account termination without notice or refund.
              </p>
            </div>
          </div>

          {/* Service Limits */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">5. Service Limits</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>Free accounts are subject to the following limits:</p>
              <div className="glass-card p-4 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--relay-border)]">
                      <th className="text-left py-2 text-[var(--relay-text)] font-semibold">Feature</th>
                      <th className="text-left py-2 text-[var(--relay-text)] font-semibold">Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--relay-border)]">
                    <tr>
                      <td className="py-2">Aliases per account</td>
                      <td className="py-2">20</td>
                    </tr>
                    <tr>
                      <td className="py-2">Emails forwarded per day</td>
                      <td className="py-2">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-2">Custom alias names</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2">Email attachment size</td>
                      <td className="py-2">25 MB</td>
                    </tr>
                    <tr>
                      <td className="py-2">API rate limit</td>
                      <td className="py-2">100 requests/minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                We reserve the right to adjust these limits to ensure fair usage across all users.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">6. Intellectual Property</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                The GhostRelay name, logo, website design, and service code are owned by GhostRelay and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Copy, modify, or distribute our source code without permission</li>
                <li>Use our brand name or logo in a misleading way</li>
                <li>Create derivative products that could be confused with GhostRelay</li>
              </ul>
              <p>
                Your content (alias labels, notes, settings) remains yours. We claim no ownership over your data.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">7. Termination</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                <strong className="text-[var(--relay-text)]">By you:</strong> You may delete your account at any time from your dashboard settings. All data will be permanently removed within 30 days.
              </p>
              <p>
                <strong className="text-[var(--relay-text)]">By us:</strong> We may suspend or terminate accounts that violate these terms, abuse the service, or have been inactive for more than 12 months. We will attempt to notify you via email before termination when possible.
              </p>
              <p>
                Upon termination, all aliases are immediately deactivated and will no longer forward emails.
              </p>
            </div>
          </div>

          {/* Disclaimers */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">8. Disclaimers & Limitations</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                GhostRelay is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>The service will be uninterrupted or error-free</li>
                <li>All emails will be delivered successfully (recipient server issues are outside our control)</li>
                <li>The service will meet all your specific requirements</li>
              </ul>
              <p>
                To the maximum extent permitted by law, GhostRelay shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">9. Indemnification</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                You agree to indemnify and hold harmless GhostRelay, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Your violation of these Terms of Service</li>
                <li>Your misuse of the service</li>
                <li>Any content transmitted through your aliases</li>
                <li>Your violation of any third party&apos;s rights</li>
              </ul>
            </div>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">10. Governing Law</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                These terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of San Francisco County, California.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">11. Changes to Terms</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>
                We may revise these terms at any time. Material changes will be communicated via email at least 14 days before taking effect. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-bold text-[var(--relay-text)] mb-3 tracking-tight">12. Contact</h2>
            <div className="space-y-3 text-sm text-[var(--relay-text-muted)] leading-relaxed">
              <p>Questions about these terms? Reach us at:</p>
              <div className="glass-card p-5 rounded-xl space-y-2">
                <p><strong className="text-[var(--relay-text)]">Email:</strong> <a href="mailto:legal@ghostrelay.me" className="text-[var(--relay-primary)] hover:underline">legal@ghostrelay.me</a></p>
                <p><strong className="text-[var(--relay-text)]">Support:</strong> <a href="mailto:support@ghostrelay.me" className="text-[var(--relay-primary)] hover:underline">support@ghostrelay.me</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
