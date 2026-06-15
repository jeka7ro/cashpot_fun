import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSettings } from "@/lib/settings";

import PublicLayout from "@/components/layout/PublicLayout";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s["seo.title"] || "CASHPOT — Merch Store",
    description: s["seo.description"] || "Merch original pentru oameni originali.",
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        { url: "/cashpot-icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/cashpot-icon-192.png", sizes: "192x192" }],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      images: [{ url: "/cashpot-icon-512.png" }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <html lang="ro" className={`${geist.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen text-white flex flex-col" style={{ background: "#0a0a0f" }}>
        <PublicLayout settings={s}>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
