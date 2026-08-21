import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionExpiredAlert from "@/components/SessionExpiredAlert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LORA - Local Omni-channel Regional Assistant",
  description: "Platform E-Commerce & Asisten AI Pemberdayaan UMKM Regional DIY & Jawa Tengah",
  icons: {
    icon: [
      { url: '/images/lora-logo.png', href: '/images/lora-logo.png' },
    ],
    shortcut: '/images/lora-logo.png',
    apple: '/images/lora-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionExpiredAlert />
        {children}
      </body>
    </html>
  );
}
