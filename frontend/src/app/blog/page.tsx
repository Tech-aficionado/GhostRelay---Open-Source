import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest news, guides, and insights about email privacy, security tips, and GhostRelay product updates.",
};

const posts = [
  {
    slug: "why-email-aliases-matter",
    title: "Why Email Aliases Matter More Than Ever in 2026",
    excerpt: "Data breaches are at an all-time high. Learn why email aliases are your first line of defense against spam and identity theft.",
    category: "Privacy",
    date: "May 28, 2026",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "catch-data-sellers",
    title: "How to Catch Companies Selling Your Email",
    excerpt: "A step-by-step guide to using unique aliases to identify exactly which service leaked or sold your personal information.",
    category: "Guide",
    date: "May 20, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "ghostrelay-v2-launch",
    title: "Introducing GhostRelay v2: Business Tier & API",
    excerpt: "We're excited to announce team management, custom domains, API access, and SSO support for organizations.",
    category: "Product",
    date: "May 12, 2026",
    readTime: "3 min read",
    featured: false,
  },
  {
    slug: "email-security-best-practices",
    title: "10 Email Security Best Practices for 2026",
    excerpt: "Beyond aliases: a comprehensive guide to securing your email communications from phishing, spoofing, and social engineering.",
    category: "Security",
    date: "Apr 30, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "spf-dkim-dmarc-explained",
    title: "SPF, DKIM, and DMARC Explained Simply",
    excerpt: "These three protocols protect against email spoofing. Here's what they do and why GhostRelay implements all three.",
    category: "Technical",
    date: "Apr 15, 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "privacy-tools-comparison",
    title: "GhostRelay vs SimpleLogin vs AnonAddy: 2026 Comparison",
    excerpt: "An honest comparison of the top email alias services. Features, pricing, and privacy policies side by side.",
    category: "Comparison",
    date: "Apr 2, 2026",
    readTime: "8 min read",
    featured: false,
  },
];

const categories = ["All", "Privacy", "Guide", "Product", "Security", "Technical", "Comparison"];

export default function BlogPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="mesh-bg text-center px-5 pt-24 pb-12 max-w-4xl mx-auto">
        <span className="text-sm text-[var(--relay-primary)] font-semibold uppercase tracking-wider">Blog</span>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-3 mb-5">
          Insights & Updates
        </h1>
        <p className="text-lg text-[var(--relay-text-muted)] max-w-xl mx-auto">
          Privacy guides, product updates, and security tips from the GhostRelay team.
        </p>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth border ${
                cat === "All"
                  ? "bg-[var(--relay-primary)]/10 border-[var(--relay-primary)]/30 text-[var(--relay-primary)]"
                  : "border-[var(--relay-border)] text-[var(--relay-text-muted)] hover:border-[var(--relay-primary)] hover:text-[var(--relay-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="px-6 md:px-10 lg:px-16 py-12 max-w-6xl mx-auto">
          <Link href={`/blog/${featured.slug}`} className="block glass-card rounded-2xl p-8 md:p-12 feature-card">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[var(--relay-primary)] bg-[var(--relay-primary)]/10 px-3 py-1 rounded-full">{featured.category}</span>
                  <span className="text-xs text-[var(--relay-text-dim)]">{featured.date}</span>
                  <span className="text-xs text-[var(--relay-text-dim)]">·</span>
                  <span className="text-xs text-[var(--relay-text-dim)]">{featured.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--relay-text)] mb-3">{featured.title}</h2>
                <p className="text-[var(--relay-text-muted)] leading-relaxed mb-4">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-[var(--relay-primary)] font-semibold text-sm">
                  Read article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
              <div className="w-full md:w-64 h-48 rounded-xl relay-gradient opacity-80 flex items-center justify-center">
                <div className="text-6xl font-bold text-white/30">GR</div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Blog Grid */}
      <section className="px-6 md:px-10 lg:px-16 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-2xl overflow-hidden feature-card">
              <div className="h-36 relay-gradient opacity-60 flex items-center justify-center">
                <div className="text-3xl font-bold text-white/20">GR</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[var(--relay-primary)] bg-[var(--relay-primary)]/10 px-2.5 py-0.5 rounded-full">{post.category}</span>
                  <span className="text-xs text-[var(--relay-text-dim)]">{post.readTime}</span>
                </div>
                <h3 className="font-semibold text-[var(--relay-text)] mb-2 leading-snug">{post.title}</h3>
                <p className="text-sm text-[var(--relay-text-muted)] leading-relaxed mb-3">{post.excerpt}</p>
                <div className="text-xs text-[var(--relay-text-dim)]">{post.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 md:px-10 lg:px-16 py-20 max-w-3xl mx-auto text-center">
        <div className="glass-card p-10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-3">Stay Updated</h2>
          <p className="text-[var(--relay-text-muted)] mb-6">Get privacy tips and product updates delivered to your inbox. No spam, obviously.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-full text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 placeholder:text-[var(--relay-text-dim)]"
            />
            <button className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-full transition-smooth btn-glow text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
