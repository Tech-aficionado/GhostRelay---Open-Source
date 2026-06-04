import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const posts: Record<string, { title: string; category: string; date: string; readTime: string; content: string[] }> = {
  "why-email-aliases-matter": {
    title: "Why Email Aliases Matter More Than Ever in 2026",
    category: "Privacy",
    date: "May 28, 2026",
    readTime: "5 min read",
    content: [
      "Data breaches have reached an all-time high in 2026, with over 4 billion records exposed globally. Your email address is the single most common piece of personal data leaked in these breaches.",
      "When you use your real email address everywhere — shopping sites, SaaS tools, newsletters, forums — you create a web of connections that makes you vulnerable to spam, phishing, and identity theft.",
      "Email aliases solve this by creating a layer of separation between your real identity and the services you interact with. Each alias is a unique, disposable address that forwards to your real inbox.",
      "If a service gets breached, you simply disable the alias. Your real email stays clean and uncompromised. You can even identify exactly which company leaked your data by using unique aliases for each service.",
      "The best part? Modern alias services like GhostRelay make this process frictionless. One click creates a new alias. One click kills it. No complex setup, no changing email providers, no learning curve.",
      "In a world where data brokers trade personal information like commodities, email aliases aren't just a nice-to-have — they're essential privacy infrastructure for anyone who uses the internet.",
    ],
  },
  "catch-data-sellers": {
    title: "How to Catch Companies Selling Your Email",
    category: "Guide",
    date: "May 20, 2026",
    readTime: "4 min read",
    content: [
      "Have you ever signed up for a service and suddenly started receiving spam from companies you've never heard of? Someone sold your email address. Here's how to catch them.",
      "The technique is simple: use a unique email alias for every service you sign up with. When spam arrives at that alias, you know exactly who sold or leaked your data.",
      "Step 1: Create a descriptive alias for each service. For example, use 'shopify-store@ghostrelay.me' for your Shopify account and 'newsletter-xyz@ghostrelay.me' for that newsletter you subscribed to.",
      "Step 2: Monitor your aliases. When you start receiving unexpected emails to a specific alias, you've identified the source of the leak.",
      "Step 3: Take action. You can disable the compromised alias, report the company for violating their privacy policy, or even take legal action under GDPR or CCPA.",
      "This approach transforms you from a passive victim of data selling into an active investigator. You'll be surprised how quickly you can identify the worst offenders in your digital life.",
    ],
  },
};

type Params = { slug: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const post = posts[params.slug];
  return {
    title: post?.title || "Blog Post",
    description: post?.content[0]?.slice(0, 160) || "Read this article on GhostRelay blog.",
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: Params }) {
  const post = posts[params.slug];

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="text-center py-32 max-w-2xl mx-auto px-5">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-[var(--relay-text-muted)] mb-8">This blog post doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="text-[var(--relay-primary)] font-semibold hover:underline">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <article className="max-w-3xl mx-auto px-5 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--relay-text-dim)] mb-8">
          <Link href="/blog" className="hover:text-[var(--relay-primary)] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[var(--relay-text-muted)]">{post.category}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-[var(--relay-primary)] bg-[var(--relay-primary)]/10 px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-sm text-[var(--relay-text-dim)]">{post.date}</span>
            <span className="text-sm text-[var(--relay-text-dim)]">·</span>
            <span className="text-sm text-[var(--relay-text-dim)]">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full relay-gradient flex items-center justify-center text-white text-xs font-bold">GR</div>
            <span className="text-sm text-[var(--relay-text-muted)]">GhostRelay Team</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-[var(--relay-text-muted)] leading-relaxed text-[15px]">{paragraph}</p>
          ))}
        </div>

        {/* Share & Navigate */}
        <div className="border-t border-[var(--relay-border)] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/blog" className="text-[var(--relay-primary)] font-semibold text-sm hover:underline flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Blog
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--relay-text-dim)]">Share:</span>
            <button className="w-8 h-8 rounded-lg border border-[var(--relay-border)] flex items-center justify-center text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] hover:border-[var(--relay-primary)] transition-smooth">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button className="w-8 h-8 rounded-lg border border-[var(--relay-border)] flex items-center justify-center text-[var(--relay-text-muted)] hover:text-[var(--relay-primary)] hover:border-[var(--relay-primary)] transition-smooth">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="text-center px-5 py-16 mesh-bg">
        <h2 className="text-2xl font-bold mb-3">Try GhostRelay Free</h2>
        <p className="text-[var(--relay-text-muted)] mb-6">Start protecting your email privacy in 30 seconds.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-full transition-smooth btn-glow text-sm">
          Get Started
        </Link>
      </section>

      <Footer />
    </>
  );
}
