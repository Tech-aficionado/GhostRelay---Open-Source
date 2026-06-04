import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GhostRelay's mission to make email privacy accessible to everyone. Built by privacy advocates for the modern internet.",
};

const team = [
  { name: "Alex Rivera", role: "Founder & CEO", avatar: "AR", bio: "Former security engineer at Cloudflare. Passionate about privacy-first infrastructure." },
  { name: "Jordan Park", role: "CTO", avatar: "JP", bio: "Full-stack engineer with 10+ years building scalable email systems." },
  { name: "Sam Chen", role: "Head of Design", avatar: "SC", bio: "Previously at Linear. Believes privacy tools should be beautiful and simple." },
  { name: "Taylor Kim", role: "Head of Security", avatar: "TK", bio: "Cryptography researcher. Ensures GhostRelay's zero-knowledge architecture stays bulletproof." },
];

const values = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: "Privacy First",
    description: "We never read, store, or analyze your emails. Your data belongs to you.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    title: "Transparent",
    description: "Open source infrastructure. Published audits. No hidden agendas.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: "User-Centric",
    description: "Every feature is designed around real user needs, not investor demands.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    title: "Performance",
    description: "Built on edge infrastructure for sub-50ms email delivery worldwide.",
  },
];

const milestones = [
  { year: "2023", title: "Founded", description: "GhostRelay was born from frustration with email spam and privacy leaks." },
  { year: "2024", title: "Public Launch", description: "Launched to the public with 10,000 users in the first month." },
  { year: "2025", title: "50K Users", description: "Crossed 50,000 active users and 2M+ emails forwarded." },
  { year: "2026", title: "Major Update", description: "Launched advanced analytics, wildcard rules, and enhanced security features." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="mesh-bg text-center px-6 pt-36 pb-20 max-w-4xl mx-auto">
        <div className="accent-line w-12 mx-auto mb-6"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
          Making Email Privacy{" "}
          <span className="relay-gradient-text">Accessible</span>
        </h1>
        <p className="text-base text-[var(--relay-text-muted)] max-w-xl mx-auto leading-relaxed">
          We believe everyone deserves to control who has their email address. GhostRelay makes that possible with a tool so simple, anyone can use it.
        </p>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-10 lg:px-16 py-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="accent-line w-8 mb-5"></div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Privacy shouldn&apos;t require a PhD</h2>
            <p className="text-[var(--relay-text-muted)] text-sm leading-relaxed mb-4">
              Every day, millions of people hand out their real email address to services they barely trust. The result? Spam, phishing, data breaches, and unwanted tracking.
            </p>
            <p className="text-[var(--relay-text-muted)] text-sm leading-relaxed mb-4">
              We built GhostRelay to give everyone the power to stay private online — without needing technical expertise or changing their email provider.
            </p>
            <p className="text-[var(--relay-text-muted)] text-sm leading-relaxed">
              One click creates an alias. One click kills it. That&apos;s how privacy should work.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="w-16 h-16 relay-gradient rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-teal-500/20 animate-float">
              G
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-[var(--relay-primary)]/5 border border-[var(--relay-primary)]/10">
                <div className="text-xl font-bold text-[var(--relay-primary)]">50K+</div>
                <div className="text-[10px] text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Active Users</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--relay-success)]/5 border border-[var(--relay-success)]/10">
                <div className="text-xl font-bold text-[var(--relay-success)]">2M+</div>
                <div className="text-[10px] text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Emails Forwarded</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--relay-accent)]/5 border border-[var(--relay-accent)]/10">
                <div className="text-xl font-bold text-[var(--relay-accent)]">99.9%</div>
                <div className="text-[10px] text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Uptime</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--relay-warning)]/5 border border-[var(--relay-warning)]/10">
                <div className="text-xl font-bold text-[var(--relay-warning)]">0</div>
                <div className="text-[10px] text-[var(--relay-text-dim)] mt-1 uppercase tracking-wider font-medium">Data Breaches</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-10 lg:px-16 py-24 max-w-6xl mx-auto grid-pattern">
        <div className="text-center mb-14">
          <div className="accent-line w-12 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold tracking-tight">What We Stand For</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((value) => (
            <div key={value.title} className="glass-card p-6 rounded-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mx-auto mb-4">
                {value.icon}
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-2">{value.title}</h3>
              <p className="text-xs text-[var(--relay-text-muted)] leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-10 lg:px-16 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="accent-line w-12 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold tracking-tight">Milestones</h2>
        </div>
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex gap-5 items-start">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg relay-gradient flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-teal-500/20">
                  {m.year.slice(2)}
                </div>
                {i < milestones.length - 1 && (
                  <div className="w-[1px] h-10 bg-gradient-to-b from-[var(--relay-primary)]/30 to-transparent mt-2"></div>
                )}
              </div>
              <div className="glass-card p-5 rounded-xl flex-1">
                <div className="text-[10px] text-[var(--relay-primary)] font-semibold mb-1 uppercase tracking-wider">{m.year}</div>
                <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">{m.title}</h3>
                <p className="text-xs text-[var(--relay-text-muted)] leading-relaxed">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="px-6 md:px-10 lg:px-16 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="accent-line w-12 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold tracking-tight">Built by Privacy Advocates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((member) => (
            <div key={member.name} className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 rounded-lg relay-gradient flex items-center justify-center text-white text-sm font-bold mx-auto mb-4 shadow-lg shadow-teal-500/20">
                {member.avatar}
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)]">{member.name}</h3>
              <p className="text-[10px] text-[var(--relay-primary)] font-medium mb-3 uppercase tracking-wider">{member.role}</p>
              <p className="text-xs text-[var(--relay-text-muted)] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-24 mesh-bg hero-glow relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Join Our Mission</h2>
          <p className="text-[var(--relay-text-muted)] mb-8 max-w-sm mx-auto text-sm">
            Start protecting your email privacy today, or reach out if you want to work with us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-7 py-3.5 rounded-lg transition-smooth btn-glow text-sm">
              Get Started
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-[var(--relay-border)] hover:border-[var(--relay-primary)]/50 text-[var(--relay-text-muted)] hover:text-[var(--relay-text)] font-medium px-7 py-3.5 rounded-lg transition-smooth text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
