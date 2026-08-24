import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCDV Field Guide — Claude Developer Certification Prep",
  description:
    "Interactive, blueprint-aligned preparation for the Claude Certified Developer — Foundations (CCDV-F) exam.",
  openGraph: {
    title: "CCDV Field Guide",
    description:
      "Master the CCDV-F curriculum and practice with a complete 53-item exam simulation.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CCDV Field Guide",
    description:
      "Blueprint-aligned curriculum and exam-style practice for Claude developers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
