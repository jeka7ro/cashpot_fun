"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
  ExternalLink, Percent, Layers, Globe, ChevronDown, X, Sun, Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

type NavItem = { href: string; label: string; icon: React.FC<{ size?: number; className?: string }>; exact?: boolean };

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 opacity-50" style={{ borderRadius: 14 }}>
        <Sun size={15} /> Tema...
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900 dark:text-white/30 dark:hover:text-white transition"
      style={{ borderRadius: 14 }}
    >
      <div className="flex items-center gap-3">
        {isDark ? <Moon size={15} /> : <Sun size={15} />}
        <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
      </div>
      <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${isDark ? "bg-violet-500" : "bg-gray-300"}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

const nav: { label: string; items: NavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "SHOP",
    items: [
      { href: "/admin/products", label: "Produse", icon: Package },
      { href: "/admin/categories", label: "Categorii", icon: Layers },
      { href: "/admin/orders", label: "Comenzi", icon: ShoppingBag },
      { href: "/admin/coupons", label: "Coduri reducere", icon: Percent },
    ],
  },
  {
    label: "CMS",
    items: [
      { href: "/admin/cms", label: "Conținut site", icon: Globe },
    ],
  },
  {
    label: "CONT",
    items: [
      { href: "/admin/settings", label: "Setări", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  const Content = () => (
    <>
      <div className="px-3 mb-8">
        <Link href="/admin" className="block mb-1">
          <Image
            src="/logo_cashpot.png"
            alt="CASHPOT"
            width={130}
            height={38}
            className="object-contain w-auto"
            style={{ maxHeight: 36 }}
          />
        </Link>
        <p className="text-gray-500 dark:text-white/20 text-[9px] tracking-widest font-bold">ADMIN PANEL</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {nav.map((group) => (
          <div key={group.label}>
            <p className="text-gray-500 dark:text-white/20 text-[9px] font-bold tracking-[0.25em] px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white"
                    }`}
                    style={{
                      borderRadius: 14,
                      background: active ? "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(109,40,217,0.9))" : "transparent",
                      boxShadow: active ? "0 4px 16px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 pt-4 border-t border-gray-200 dark:border-white/5">
        <ThemeToggle />
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900 dark:text-white/30 dark:hover:text-white transition"
          style={{ borderRadius: 14 }}>
          <ExternalLink size={15} /> Site public
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 transition"
          style={{ borderRadius: 14 }}>
          <LogOut size={15} /> Deconectare
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col py-6 px-3 z-50 bg-white/80 dark:bg-[#080810]/85 border-r border-gray-200 dark:border-[rgba(124,58,237,0.15)]"
        style={{ backdropFilter: "blur(24px)" }}
      >
        <Content />
      </aside>

      {/* Mobile bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 h-14 flex items-center justify-between bg-white/90 dark:bg-[#080810]/90 border-b border-gray-200 dark:border-[rgba(124,58,237,0.15)]"
        style={{ backdropFilter: "blur(20px)" }}
      >
        <Link href="/admin">
          <Image
            src="/logo_cashpot.png"
            alt="CASHPOT"
            width={110}
            height={32}
            className="object-contain w-auto"
            style={{ maxHeight: 30 }}
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white transition bg-gray-100 dark:bg-white/5"
          style={{ borderRadius: 10 }}
        >
          {mobileOpen ? <X size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col pt-14 px-3 py-6 overflow-y-auto bg-white/95 dark:bg-[#080810]/95"
          style={{ backdropFilter: "blur(24px)" }}
        >
          <Content />
        </div>
      )}
    </>
  );
}
