import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostRelay - Your Emails, Invisible to the World",
  description:
    "Generate ghost email aliases to protect your real inbox from spam, data breaches, and unwanted tracking. Your emails pass through like a ghost.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
