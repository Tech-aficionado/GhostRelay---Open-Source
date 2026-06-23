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
      "The average person has accounts on over 100 online services. Each one represents a potential breach point. A single leaked email address can lead to credential stuffing attacks across every other service where you used that same address.",
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
      "Under GDPR, companies face fines of up to €20 million or 4% of global revenue for unauthorized data sharing. Under CCPA, California residents can claim $100–$750 per incident in statutory damages.",
      "This approach transforms you from a passive victim of data selling into an active investigator. You'll be surprised how quickly you can identify the worst offenders in your digital life.",
    ],
  },
  "ghostrelay-v2-launch": {
    title: "Introducing GhostRelay v2: What's New",
    category: "Product",
    date: "May 12, 2026",
    readTime: "3 min read",
    content: [
      "We're excited to announce GhostRelay v2 — the biggest update since our launch. This release focuses on making email privacy more powerful while keeping the simplicity you love.",
      "Wildcard aliases: You can now create pattern-based rules like '*-shopping@ghostrelay.me' that automatically catch and forward emails without pre-creating each alias. Perfect for when you need an alias on the spot.",
      "Multiple forwarding destinations: A single alias can now forward to multiple email addresses. Use this for team inboxes, shared project emails, or forwarding to both your work and personal accounts.",
      "Sender blocklist: Block specific senders per-alias without disabling the entire alias. If one spammer finds your alias, just block them and keep receiving legitimate emails.",
      "Enhanced analytics: A full analytics dashboard showing forwarding volume over time, busiest days, most active aliases, and unique sender counts. Understand your email patterns at a glance.",
      "Bounce tracking: Automatically detect and surface email delivery failures. Get alerted when an alias starts bouncing so you can take action before it affects your deliverability.",
      "Browser extension: A Chrome/Firefox extension that detects email signup forms and offers to auto-fill a new alias. Creating aliases is now literally one click from any website.",
      "All features remain free for personal use. We believe email privacy is a right, not a premium feature.",
    ],
  },
  "email-security-best-practices": {
    title: "10 Email Security Best Practices for 2026",
    category: "Security",
    date: "Apr 30, 2026",
    readTime: "7 min read",
    content: [
      "Email remains the number one attack vector for cybercriminals. Over 90% of cyberattacks begin with a phishing email. Here are ten practices that dramatically reduce your risk.",
      "1. Use unique email aliases for every service. When one gets compromised, your entire digital identity doesn't collapse. Compartmentalization is your strongest defense.",
      "2. Enable two-factor authentication everywhere. SMS-based 2FA is better than nothing, but app-based TOTP (like Google Authenticator) or hardware keys (YubiKey) are significantly more secure against SIM-swapping attacks.",
      "3. Never click links in unexpected emails. Even if the email appears to come from a service you use, navigate directly to the website by typing the URL. Phishing emails now use pixel-perfect replicas of legitimate login pages.",
      "4. Check the sender's actual email address. Display names can be spoofed easily. Always inspect the full 'From' address. Look for subtle misspellings: 'support@amaz0n.com' or 'billing@paypa1.com' are common tricks.",
      "5. Be wary of urgency and threats. Phishing emails often create false urgency — 'Your account will be suspended in 24 hours!' Legitimate companies rarely threaten immediate action via email.",
      "6. Use a password manager with unique passwords for every account. If attackers obtain your email from a breach, they'll attempt credential stuffing against other services. Unique passwords stop this cold.",
      "7. Keep your email client updated. Email clients regularly patch vulnerabilities that could allow remote code execution through malformed messages or malicious attachments.",
      "8. Don't open unexpected attachments. Even seemingly innocent file types like PDFs and Word documents can contain malware. If you weren't expecting a file, verify with the sender through a different channel.",
      "9. Use encrypted email for sensitive communications. Standard email is transmitted in plaintext. For confidential data, use end-to-end encryption (PGP/GPG) or encrypted messaging platforms.",
      "10. Regularly audit your connected accounts. Review which services have your email, revoke access for unused OAuth connections, and delete accounts you no longer use. Every dormant account is a potential breach point.",
      "Implementing even half of these practices puts you ahead of 95% of internet users in terms of email security. Start with aliases and 2FA — they deliver the highest protection for the least effort.",
    ],
  },
  "spf-dkim-dmarc-explained": {
    title: "SPF, DKIM, and DMARC Explained Simply",
    category: "Technical",
    date: "Apr 15, 2026",
    readTime: "6 min read",
    content: [
      "Every day, billions of emails are sent with forged sender addresses. SPF, DKIM, and DMARC are three protocols that work together to prevent this email spoofing. Here's how they work in plain language.",
      "SPF (Sender Policy Framework) is like a guest list for your domain. It's a DNS record that says: 'Only these specific mail servers are authorized to send email from my domain.' When a receiving server gets an email claiming to be from your domain, it checks the SPF record to verify the sending server is on the list.",
      "DKIM (DomainKeys Identified Mail) adds a cryptographic signature to every email. Think of it as a tamper-proof seal. The sending server signs the email with a private key, and the receiving server verifies it using a public key published in DNS. If anyone modifies the email in transit, the signature breaks.",
      "DMARC (Domain-based Message Authentication, Reporting & Conformance) ties SPF and DKIM together with a policy. It tells receiving servers: 'If an email fails both SPF and DKIM checks, here's what to do with it.' Options are: monitor only, quarantine (send to spam), or reject outright.",
      "Why does this matter for email aliases? When GhostRelay forwards email from your alias, the forwarded message needs to pass these checks at the receiving end (your real inbox). Without proper authentication, forwarded emails would land in spam.",
      "GhostRelay solves this by re-signing forwarded emails with its own DKIM keys and setting proper SPF records. The email arrives at your inbox with valid authentication, even though it was forwarded through an intermediary.",
      "Here's the flow: Original sender → their mail server (signed with their DKIM) → GhostRelay's servers (re-signed with GhostRelay's DKIM) → your inbox (verifies GhostRelay's signature). The original sender information is preserved in the Reply-To header so you can still respond.",
      "Without these protocols, anyone could send an email pretending to be your bank, your employer, or your government. They're invisible to end users but form the backbone of email trust on the internet.",
      "You can check any domain's email authentication setup using tools like MXToolbox or Google's Check MX. A properly configured domain will show SPF: pass, DKIM: pass, and DMARC: pass in email headers.",
    ],
  },
  "privacy-tools-comparison": {
    title: "GhostRelay vs SimpleLogin vs AnonAddy: 2026 Comparison",
    category: "Comparison",
    date: "Apr 2, 2026",
    readTime: "8 min read",
    content: [
      "Email alias services have matured significantly. Here's an honest comparison of three popular options: GhostRelay, SimpleLogin, and AnonAddy (now addy.io). Each has different strengths depending on your needs.",
      "Pricing: GhostRelay offers a generous personal plan with up to 20 aliases and unlimited forwarding at no cost. SimpleLogin provides 10 aliases on their starter plan, with premium at $4/month for unlimited. Addy.io offers unlimited standard aliases on their basic plan, with premium features at $1/month.",
      "Ease of use: GhostRelay prioritizes simplicity — one-click alias creation from a clean dashboard or browser extension. SimpleLogin has a mature interface with browser extensions for all major browsers. Addy.io is more technical, offering API-first features that appeal to developers.",
      "Custom domains: All three support custom domains on paid plans. If you own 'yourdomain.com', you can create aliases like 'anything@yourdomain.com'. This means if you switch services, your aliases still work.",
      "Reply capability: All three services support replying from your alias address. When you reply to a forwarded email, the response goes through the service so the recipient never sees your real address.",
      "Open source: SimpleLogin and Addy.io are both open source, meaning anyone can audit the code. GhostRelay's worker code is based on Cloudflare Workers with transparent architecture. All three take privacy seriously.",
      "Infrastructure: GhostRelay runs on Cloudflare's edge network (250+ cities worldwide), providing fast delivery and built-in DDoS protection. SimpleLogin uses standard hosting. Addy.io uses dedicated servers in the Netherlands.",
      "Who should use what? Choose GhostRelay if you want the simplest possible setup with strong privacy defaults and edge-network speed. Choose SimpleLogin if you want a proven, open-source solution with mature PGP encryption support. Choose Addy.io if you're technical and want maximum flexibility with regex-based aliases and API automation.",
      "The most important thing isn't which service you pick — it's that you start using email aliases at all. Any of these three is vastly better than giving out your real email address everywhere.",
    ],
  },
};

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  return {
    title: post?.title || "Blog Post",
    description: post?.content[0]?.slice(0, 160) || "Read this article on GhostRelay blog.",
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = posts[slug];

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

        {/* Navigate */}
        <div className="border-t border-[var(--relay-border)] mt-12 pt-8">
          <Link href="/blog" className="text-[var(--relay-primary)] font-semibold text-sm hover:underline flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Blog
          </Link>
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
