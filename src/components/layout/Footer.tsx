"use client";

import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/lib/settings";
import { usePathname } from "next/navigation";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const name = settings["site.name"] || "CASHPOT";

  return (
    <footer className="mt-20" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
      {/* Glass panel */}
      <div style={{ background: "rgba(10,10,20,0.8)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Image
                src="/logo_cashpot.png"
                alt={name}
                width={160}
                height={48}
                className="object-contain w-auto"
                style={{ maxHeight: 48 }}
              />
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-5">
              {settings["footer.text"] || settings["site.tagline"] || ""}
            </p>
            <div className="flex gap-2">
              {settings["site.instagram"] && (
                <a href={settings["site.instagram"]} target="_blank" rel="noopener noreferrer"
                  className="glass text-white/50 hover:text-white transition text-xs font-bold px-3 py-2"
                  style={{ borderRadius: 10 }}>
                  IG
                </a>
              )}
              {settings["site.tiktok"] && (
                <a href={settings["site.tiktok"]} target="_blank" rel="noopener noreferrer"
                  className="glass text-white/50 hover:text-white transition text-xs font-bold px-3 py-2"
                  style={{ borderRadius: 10 }}>
                  TT
                </a>
              )}
              {settings["site.facebook"] && (
                <a href={settings["site.facebook"]} target="_blank" rel="noopener noreferrer"
                  className="glass text-white/50 hover:text-white transition text-xs font-bold px-3 py-2"
                  style={{ borderRadius: 10 }}>
                  FB
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Shop</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/shop", label: "Toate produsele" },
                { href: "/shop?tag=Bărbați", label: "Bărbați" },
                { href: "/shop?tag=Femei", label: "Femei" },
                { href: "/shop?category=tricouri", label: "Tricouri" },
                { href: "/shop?category=hanorace", label: "Hanorace" },
                { href: "/shop?category=accesorii", label: "Accesorii" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-white/40 hover:text-white text-sm transition">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Info</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/shipping" className="text-white/40 hover:text-white text-sm transition">Livrare & Retur</Link>
              <Link href="/contact" className="text-white/40 hover:text-white text-sm transition">Contact</Link>
              {settings["site.email"] && (
                <a href={`mailto:${settings["site.email"]}`} className="text-white/40 hover:text-white text-sm transition">
                  {settings["site.email"]}
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          className="py-6 px-4 text-center text-white/20 text-xs">
          © {new Date().getFullYear()} {name}.RO — Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
