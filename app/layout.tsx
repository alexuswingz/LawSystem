import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alexus | AI Legal Assistant",
  description:
    "Alexus - Your intelligent legal assistant specializing in Philippine Law. Get accurate answers to your legal questions.",
  keywords: ["Philippine Law", "Legal Assistant", "AI Lawyer", "Legal Advice", "Alexus"],
  authors: [{ name: "Alexus Legal AI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alexus",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans text-white antialiased bg-black">{children}</body>
    </html>
  );
}