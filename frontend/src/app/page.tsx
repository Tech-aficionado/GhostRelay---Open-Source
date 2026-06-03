import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "👻",
    title: "Ghost Mode Privacy",
    description:
      "Your real email stays invisible. Services only see your ghost alias — never the real you.",
  },
  {
    icon: "🔮",
    title: "Vanish Spam Instantly",
    description:
      "Getting spam? Disable the alias and it vanishes. Your real inbox stays pristine.",
  },
  {
    icon: "🕵️",
    title: "Unmask Data Sellers",
    description:
      "Use unique ghost aliases per service — instantly know who leaked or sold your email.",
  },
  {
    icon: "⚡",
    title: "Summon in One Click",
    description:
      "Generate a new ghost alias instantly. No configuration, no waiting.",
  },
  {
    icon: "🔗",
    title: "Seamless Forwarding",
    description:
      "Emails pass through your ghost alias to your real inbox. Completely transparent.",
  },
  {
    icon: "🆓",
    title: "Haunt for Free",
    description:
      "Core features are free forever. Built on Cloudflare's generous free tier.",
  },
];

const steps = [
  {
    number: 1,
    title: "Summon",
    description: "Create an account with your real email — it stays hidden in the shadows.",
  },
  {
    number: 2,
    title: "Generate Ghosts",
    description:
      "Conjure random ghost aliases for each service you sign up for.",
  },
  {
    number: 3,
    title: "Deploy Everywhere",
    description:
      "Give out your ghost alias. Emails relay through invisibly to your inbox.",
  },
  {
    number: 4,
    title: "Vanish at Will",
    description: "Disable or banish any alias from your haunting dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="text-center px-5 pt-24 pb-20 max-w-3xl mx-auto">
        <div className="text-6xl mb-6 animate-float">👻</div>
        <h1 className="text-5xl font-extrabold mb-5 leading-tight">
          Your Emails, <span className="ghost-gradient-text">Invisible to the World</span>
        </h1>
        <p className="text-lg text-[#8892b0] mb-10 max-w-xl mx-auto">
          Generate ghost email aliases that forward to your real inbox. Stay hidden from spam, data breaches, and prying eyes.
        </p>

        {/* Demo Box */}
        <div className="inline-flex items-center gap-4 bg-[#12182b] px-8 py-5 rounded-xl border border-[#2a3563] flex-wrap justify-center mb-10 ghost-glow">
          <div className="text-center">
            <span className="text-[11px] text-[#8892b0] uppercase tracking-wide block mb-1">
              Your real email (hidden)
            </span>
            <span className="font-mono text-sm bg-[#f43f5e]/15 text-[#fda4af] px-3 py-1.5 rounded-md line-through">
              you@gmail.com
            </span>
          </div>
          <span className="text-2xl text-[#8892b0]">👻→</span>
          <div className="text-center">
            <span className="text-[11px] text-[#8892b0] uppercase tracking-wide block mb-1">
              What services see
            </span>
            <span className="font-mono text-sm bg-[#06d6a0]/15 text-[#6ee7b7] px-3 py-1.5 rounded-md">
              xk7r9m@ghostrelay.me
            </span>
          </div>
        </div>

        <div>
          <Link
            href="/dashboard"
            className="inline-block bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            Start Haunting — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-10 py-20 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Why Go Ghost?</h2>
        <p className="text-[#8892b0] mb-12 max-w-lg mx-auto">Protect your identity with phantom email aliases that disappear on command.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#12182b] p-8 rounded-xl border border-[#2a3563] text-left transition-all hover:-translate-y-1 hover:border-[#7c3aed] hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-[#e8eaf6]">{feature.title}</h3>
              <p className="text-[#8892b0] text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-10 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">How GhostRelay Works</h2>
        <p className="text-[#8892b0] mb-12">Four simple steps to digital invisibility.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-[#7c3aed] rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                {step.number}
              </div>
              <h3 className="font-semibold mb-2 text-[#e8eaf6]">{step.title}</h3>
              <p className="text-[#8892b0] text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-10 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-[#8892b0] mb-12">Start haunting for free. Upgrade when you need more phantoms.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#12182b] p-10 rounded-xl border border-[#2a3563]">
            <h3 className="text-xl font-semibold mb-3 text-[#e8eaf6]">Ghost</h3>
            <div className="text-5xl font-extrabold mb-6 text-[#e8eaf6]">
              $0<span className="text-base text-[#8892b0] font-normal">/forever</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {["5 ghost aliases", "Unlimited forwarding", "Enable/disable aliases", "Haunting dashboard"].map((item) => (
                <li key={item} className="text-[#8892b0] text-sm border-b border-[#2a3563] pb-2">
                  <span className="text-[#06d6a0] font-bold mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="block text-center border border-[#2a3563] hover:border-[#7c3aed] text-[#e8eaf6] font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#12182b] p-10 rounded-xl border border-[#7c3aed] relative scale-105 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-xs font-semibold px-4 py-1 rounded-full text-white">
              Poltergeist
            </span>
            <h3 className="text-xl font-semibold mb-3 text-[#e8eaf6]">Pro</h3>
            <div className="text-5xl font-extrabold mb-6 text-[#e8eaf6]">
              $3<span className="text-base text-[#8892b0] font-normal">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Unlimited ghost aliases",
                "Custom alias names",
                "Reply from ghost alias",
                "Haunt analytics",
                "Priority support",
              ].map((item) => (
                <li key={item} className="text-[#8892b0] text-sm border-b border-[#2a3563] pb-2">
                  <span className="text-[#06d6a0] font-bold mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="block text-center bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Go Poltergeist
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-[#2a3563] text-[#8892b0] text-sm">
        <p>👻 GhostRelay — Your emails, invisible to the world.</p>
      </footer>
    </>
  );
}
