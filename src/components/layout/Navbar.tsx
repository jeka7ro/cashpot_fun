"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, X, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Props = { brandName: string; hasAnnouncement: boolean };

const NAV_LINKS = [
  { href: "/shop", label: "SHOP" },
  { href: "/shop?tag=Bărbați", label: "BĂRBAȚI" },
  { href: "/shop?tag=Femei", label: "FEMEI" },
  { href: "/shop?category=tricouri", label: "TRICOURI" },
  { href: "/shop?category=hanorace", label: "HANORACE" },
  { href: "/shop?category=accesorii", label: "ACCESORII" },
];

export default function Navbar({ brandName, hasAnnouncement }: Props) {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
      setQ("");
      setSearchOpen(false);
    }
  };

  const isActive = (href: string) =>
    href === "/shop" ? pathname === "/shop" : pathname + (typeof window !== "undefined" ? window.location.search : "") === href;

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(8,8,18,0.98)"
            : "rgba(8,8,18,0.92)",
          borderBottom: scrolled
            ? "1px solid rgba(124,58,237,0.2)"
            : "1px solid rgba(124,58,237,0.1)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo_cashpot.png"
              alt="CASHPOT"
              width={130}
              height={36}
              className="object-contain w-auto"
              style={{ maxHeight: 34 }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-xs font-bold tracking-[0.12em] transition-all"
                style={{
                  borderRadius: 9999,
                  color: "rgba(255,255,255,0.55)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search toggle */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }}
              className="w-9 h-9 flex items-center justify-center transition-all"
              style={{
                borderRadius: 10,
                color: searchOpen ? "#a78bfa" : "rgba(255,255,255,0.55)",
                background: searchOpen ? "rgba(124,58,237,0.15)" : "transparent",
              }}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center transition-all"
              style={{ borderRadius: 10, color: "rgba(255,255,255,0.7)" }}
            >
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-black flex items-center justify-center"
                  style={{
                    width: 18, height: 18,
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    borderRadius: 9999,
                    boxShadow: "0 2px 8px rgba(124,58,237,0.6)",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }}
              className="md:hidden w-9 h-9 flex items-center justify-center transition-all"
              style={{
                borderRadius: 10,
                color: "rgba(255,255,255,0.6)",
                background: mobileOpen ? "rgba(255,255,255,0.07)" : "transparent",
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                autoFocus
                type="text"
                placeholder="Caută produse..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input-glass flex-1 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="btn-primary text-xs"
                style={{ padding: "10px 20px" }}
              >
                Caută
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-3 py-3 flex flex-col gap-1"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-3 text-xs font-bold tracking-[0.12em] text-white/60 hover:text-white hover:bg-white/5 transition"
                style={{ borderRadius: 12 }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Spacer so content starts below fixed header */}
      <div style={{ height: 64 }} />
    </>
  );
}
