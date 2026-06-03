import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmailAlias - Protect Your Privacy",
  description:
    "Generate masked email aliases to protect your real inbox from spam, data breaches, and unwanted tracking.",
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
