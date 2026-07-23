import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
  ],
};

const SITE_URL = "https://www.ghostrelay.me";
const SITE_TITLE = "GhostRelay — Email Privacy, Simplified";
const SITE_DESCRIPTION =
  "Create disposable email aliases that forward to your real inbox. Protect your identity from spam, data breaches, and tracking — free and open source.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | GhostRelay",
  },
  description: SITE_DESCRIPTION,
  applicationName: "GhostRelay",
  category: "productivity",
  keywords: [
    "email alias",
    "email privacy",
    "disposable email",
    "email forwarding",
    "email masking",
    "spam protection",
    "temporary email",
    "anonymous email",
    "privacy tool",
    "ghostrelay",
  ],
  authors: [{ name: "GhostRelay", url: SITE_URL }],
  creator: "GhostRelay",
  publisher: "GhostRelay",
  metadataBase: new URL(SITE_URL),
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    title: "GhostRelay",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/logo.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "GhostRelay",
    title: SITE_TITLE,
    description:
      "Give every service its own ghost address. Kill spam with one click — your real inbox stays invisible.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostRelay — Privacy-focused email aliasing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "Give every service its own ghost address. Kill spam with one click — your real inbox stays invisible.",
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
    canonical: SITE_URL,
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
