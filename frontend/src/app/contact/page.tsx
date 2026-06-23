"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="mesh-bg text-center px-6 pt-36 pb-16 max-w-4xl mx-auto">
        <div className="accent-line w-12 mx-auto mb-6"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
          Get In Touch
        </h1>
        <p className="text-base text-[var(--relay-text-muted)] max-w-md mx-auto">
          Have a question, found a bug, or want to suggest a feature? We&apos;d love to hear from you.
        </p>
      </section>

      {/* Content */}
      <section className="px-6 md:px-10 lg:px-16 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">Email</h3>
              <a href="mailto:support@ghostrelay.me" className="text-xs text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors block">support@ghostrelay.me</a>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">GitHub</h3>
              <a href="https://github.com/ghostrelay" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] transition-colors block">github.com/ghostrelay</a>
              <p className="text-xs text-[var(--relay-text-dim)] mt-1">Issues &amp; feature requests</p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">Response Time</h3>
              <p className="text-xs text-[var(--relay-text-muted)]">Usually within 24 hours</p>
              <p className="text-xs text-[var(--relay-text-dim)] mt-1">Faster for critical issues</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-7 md:p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] relay-gradient"></div>
              <h2 className="text-lg font-bold mb-6 text-[var(--relay-text)]">Send Us a Message</h2>
              
              {submitted && (
                <div className="mb-6 p-3.5 bg-[var(--relay-success)]/8 border border-[var(--relay-success)]/15 rounded-lg text-[var(--relay-success)] text-xs text-center font-medium">
                  Message sent! We&apos;ll get back to you within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">Subject</label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="privacy">Privacy / Data Request</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-[var(--relay-text-muted)] mb-1.5">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full px-3.5 py-2.5 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-[var(--relay-text)] text-sm focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold py-3 rounded-lg transition-smooth btn-glow text-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-10 lg:px-16 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How do I report a security vulnerability?", a: "Email security@ghostrelay.me with details. We take security seriously and respond to responsible disclosure within 24 hours." },
            { q: "Can I request my data be deleted?", a: "Yes. You can delete your account from Settings, or email support@ghostrelay.me for a manual data deletion request under GDPR." },
            { q: "Is there an API available?", a: "Not yet publicly, but it's on the roadmap. Follow our GitHub for updates on the public API release." },
            { q: "How do I report spam coming through an alias?", a: "Use the sender blocklist feature in your dashboard to block specific senders, or disable the alias entirely if it's compromised." },
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 rounded-xl">
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-2">{item.q}</h3>
              <p className="text-xs text-[var(--relay-text-muted)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
