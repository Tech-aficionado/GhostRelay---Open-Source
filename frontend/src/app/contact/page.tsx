"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated form submission
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
          Have a question, want to partner, or need enterprise support? We&apos;d love to hear from you.
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
              <p className="text-xs text-[var(--relay-text-muted)]">support@ghostrelay.me</p>
              <p className="text-xs text-[var(--relay-text-muted)]">sales@ghostrelay.me</p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">Live Chat</h3>
              <p className="text-xs text-[var(--relay-text-muted)]">Mon-Fri, 9am-6pm EST</p>
              <p className="text-xs text-[var(--relay-text-muted)]">Avg response: &lt;2 hours</p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">Social</h3>
              <p className="text-xs text-[var(--relay-text-muted)]">@ghostrelay on Twitter</p>
              <p className="text-xs text-[var(--relay-text-muted)]">discord.gg/ghostrelay</p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[var(--relay-primary)]/8 border border-[var(--relay-primary)]/15 flex items-center justify-center text-[var(--relay-primary)] mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-[var(--relay-text)] mb-1">Office</h3>
              <p className="text-xs text-[var(--relay-text-muted)]">San Francisco, CA</p>
              <p className="text-xs text-[var(--relay-text-muted)]">Remote-first team 🌍</p>
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
                    <option value="sales">Sales / Enterprise</option>
                    <option value="partnership">Partnership</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
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

      {/* Enterprise CTA */}
      <section className="px-6 md:px-10 lg:px-16 py-16 max-w-4xl mx-auto text-center">
        <div className="glass-card p-8 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] relay-gradient"></div>
          <h2 className="text-xl font-bold mb-3 tracking-tight">Need Enterprise Support?</h2>
          <p className="text-[var(--relay-text-muted)] text-sm mb-6 max-w-sm mx-auto">
            Custom domains, SSO, dedicated account management, and SLA guarantees for your organization.
          </p>
          <a href="mailto:sales@ghostrelay.me" className="inline-flex items-center gap-2 bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-lg transition-smooth btn-glow text-sm">
            Talk to Sales
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
