import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  title: {
    default: "GhostRelay — Email Privacy, Simplified",
    template: "%s | GhostRelay",
  },
  description:
    "Create unlimited email aliases that forward to your real inbox. Protect your identity from spam, data breaches, and unwanted tracking. Free forever.",
  keywords: [
    "email alias",
    "email privacy",
    "disposable email",
    "email forwarding",
    "email masking",
    "spam protection",
    "privacy tool",
    "ghostrelay",
  ],
  authors: [{ name: "GhostRelay" }],
  creator: "GhostRelay",
  metadataBase: new URL("https://www.ghostrelay.me"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ghostrelay.me",
    siteName: "GhostRelay",
    title: "GhostRelay — Email Privacy, Simplified",
    description:
      "Create email aliases that forward to your real inbox. Stay hidden from spam and data breaches.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostRelay — Your Emails, Invisible to the World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostRelay — Email Privacy, Simplified",
    description:
      "Create email aliases that forward to your real inbox. Stay hidden from spam and data breaches.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.ghostrelay.me",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
