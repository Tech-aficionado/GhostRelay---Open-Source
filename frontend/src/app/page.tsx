import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "🔒",
    title: "Privacy Protection",
    description:
      "Never reveal your real email address to services you don't fully trust.",
  },
  {
    icon: "🗑️",
    title: "Spam Control",
    description:
      "Getting spam? Just disable the alias. Your real inbox stays clean.",
  },
  {
    icon: "🔍",
    title: "Track Who Sells Your Data",
    description:
      "Use unique aliases per service — instantly know who leaked your email.",
  },
  {
    icon: "⚡",
    title: "Instant Setup",
    description:
      "Generate a new alias in one click. No configuration needed.",
  },
  {
    icon: "🔁",
    title: "Seamless Forwarding",
    description:
      "All mail sent to your alias lands in your real inbox automatically.",
  },
  {
    icon: "💰",
    title: "Free Forever",
    description:
      "Core features are free. Built on Cloudflare's generous free tier.",
  },
];

const steps = [
  {
    number: 1,
    title: "Sign Up",
    description: "Create an account with your real email address (kept private).",
  },
  {
    number: 2,
    title: "Generate Aliases",
    description:
      "Create random or custom aliases for each service you sign up for.",
  },
  {
    number: 3,
    title: "Use Everywhere",
    description:
      "Give out your alias instead of your real email. Emails forward to your inbox.",
  },
  {
    number: 4,
    title: "Stay in Control",
    description: "Disable or delete aliases anytime from your dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="text-center px-5 pt-24 pb-20 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-5 leading-tight">
          Your Email, <span className="text-indigo-300">Your Rules</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Generate unlimited masked email aliases to protect your real inbox
          from spam, data breaches, and unwanted tracking.
        </p>

        {/* Demo Box */}
        <div className="inline-flex items-center gap-4 bg-slate-800 px-8 py-5 rounded-xl border border-slate-700 flex-wrap justify-center mb-10">
          <div className="text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
              Your real email (hidden)
            </span>
            <span className="font-mono text-sm bg-red-500/15 text-red-300 px-3 py-1.5 rounded-md line-through">
              you@gmail.com
            </span>
          </div>
          <span className="text-2xl text-slate-400">→</span>
          <div className="text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block mb-1">
              What services see
            </span>
            <span className="font-mono text-sm bg-green-500/15 text-green-300 px-3 py-1.5 rounded-md">
              xk7r9m@yourdomain.com
            </span>
          </div>
        </div>

        <div>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-10 py-20 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Why Use Email Aliases?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-left transition-all hover:-translate-y-1 hover:border-indigo-500"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-10 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-10 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-800 p-10 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-3">Free</h3>
            <div className="text-5xl font-extrabold mb-6">
              $0<span className="text-base text-slate-400 font-normal">/forever</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {["5 email aliases", "Unlimited forwarding", "Enable/disable aliases", "Basic dashboard"].map((item) => (
                <li key={item} className="text-slate-400 text-sm border-b border-slate-700 pb-2">
                  <span className="text-green-400 font-bold mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="block text-center border border-slate-600 hover:border-indigo-500 text-slate-200 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-slate-800 p-10 rounded-xl border border-indigo-500 relative scale-105">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-xs font-semibold px-4 py-1 rounded-full">
              Popular
            </span>
            <h3 className="text-xl font-semibold mb-3">Pro</h3>
            <div className="text-5xl font-extrabold mb-6">
              $3<span className="text-base text-slate-400 font-normal">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Unlimited aliases",
                "Custom alias names",
                "Reply from alias",
                "Activity analytics",
                "Priority support",
              ].map((item) => (
                <li key={item} className="text-slate-400 text-sm border-b border-slate-700 pb-2">
                  <span className="text-green-400 font-bold mr-2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-700 text-slate-400 text-sm">
        <p>&copy; 2024 EmailAlias. Built with privacy in mind.</p>
      </footer>
    </>
  );
}
