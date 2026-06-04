import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <section className="min-h-[70vh] flex items-center justify-center px-5 mesh-bg">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 relay-gradient rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-500/20 animate-float">
            404
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--relay-text)] mb-3">Page Not Found</h1>
          <p className="text-[var(--relay-text-muted)] mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-full transition-smooth btn-glow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Go Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-[var(--relay-border)] hover:border-[var(--relay-primary)] text-[var(--relay-text)] font-semibold px-6 py-3 rounded-full transition-smooth"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
