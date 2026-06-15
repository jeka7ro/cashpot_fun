import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, featured, latest, categories] = await Promise.all([
    getSettings(),
    prisma.product.findMany({ where: { published: true, featured: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { published: true }, take: 8, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { position: "asc" } }),
  ]);

  const name = settings["site.name"] || "CASHPOT";
  const half = Math.floor(name.length / 2);
  const p1 = name.slice(0, half);
  const p2 = name.slice(half);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0d0a18 0%, #0a0a0f 40%, #0c0a18 100%)" }} />
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-[80px]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-[60px]" style={{ background: "radial-gradient(circle, #5b21b6, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-10 blur-[50px]" style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
        </div>

        <div className="relative text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8">
            <span className="glass-violet text-violet-300 text-xs font-bold tracking-[0.3em] px-5 py-2 uppercase"
              style={{ borderRadius: 9999 }}>
              {settings["hero.badge"] || "Limited Drop"}
            </span>
          </div>

          <div className="flex justify-center mb-6">
            <Image
              src="/logo_cashpot.png"
              alt="CASHPOT"
              width={420}
              height={120}
              className="object-contain w-auto"
              style={{ maxWidth: "min(420px, 80vw)", filter: "drop-shadow(0 0 40px rgba(124,58,237,0.6))" }}
              priority
            />
          </div>

          <p className="text-white/50 text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed">
            {settings["hero.subtitle"] || settings["site.tagline"] || ""}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              {settings["hero.cta1"] || "SHOP NOW"} <ArrowRight size={16} />
            </Link>
            <Link href="/shop?featured=1" className="btn-ghost inline-flex items-center gap-2">
              {settings["hero.cta2"] || "FEATURED DROPS"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── SHIPPING STRIP ────────────────────────────────── */}
      <div style={{ background: "rgba(124,58,237,0.06)", borderTop: "1px solid rgba(124,58,237,0.15)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 text-white/40 text-xs tracking-wide">
          <span>🚚 Livrare gratuită peste {settings["shipping.freeAbove"] || "200"} RON</span>
          <span>📦 {settings["shipping.estimatedDays"] || "2-5"} zile lucrătoare</span>
          <span>↩️ Retur 30 zile</span>
          <span>✅ Calitate premium</span>
        </div>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <p className="text-violet-400/50 text-[10px] tracking-[0.3em] uppercase mb-3">Categorii</p>
          <h2 className="text-white text-3xl font-black tracking-tight mb-8">COLECȚII</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                className="group glass-card relative h-52 flex items-end p-7 overflow-hidden"
                style={{ borderRadius: 28 }}>
                {/* Gradient inside */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), transparent)" }} />
                <div className="relative">
                  <p className="text-violet-400/50 text-[10px] tracking-widest mb-1.5 uppercase">Explorează</p>
                  <h3 className="text-white font-black text-3xl tracking-tight group-hover:text-violet-300 transition">
                    {cat.name.toUpperCase()}
                  </h3>
                </div>
                <ArrowRight
                  className="absolute right-7 bottom-7 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition"
                  size={22}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-violet-400/50 text-[10px] tracking-[0.3em] uppercase mb-2">Featured</p>
              <h3 className="text-white text-3xl font-black tracking-tight">DROPS SELECTATE</h3>
            </div>
            <Link href="/shop?featured=1" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition flex items-center gap-1">
              Vezi toate <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── LATEST ────────────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-violet-400/50 text-[10px] tracking-[0.3em] uppercase mb-2">Nou</p>
              <h3 className="text-white text-3xl font-black tracking-tight">ULTIMELE ADĂUGIRI</h3>
            </div>
            <Link href="/shop" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition flex items-center gap-1">
              Tot shopul <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div
          className="relative overflow-hidden p-14 text-center"
          style={{
            borderRadius: 36,
            background: "linear-gradient(135deg, #1a0a3a 0%, #2d1060 40%, #1a0a3a 100%)",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "0 0 80px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Blobs inside */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full blur-3xl opacity-40" style={{ background: "#7c3aed" }} />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: "#f59e0b" }} />
          </div>
          <div className="relative">
            <p className="text-violet-300/60 text-xs tracking-[0.3em] uppercase mb-3">Cashpot drops</p>
            <h2 className="text-white text-5xl font-black tracking-tighter mb-4">
              FRESH <span className="text-violet-400">DROP</span>
            </h2>
            <p className="text-white/50 mb-10 text-lg">Nou în fiecare săptămână. Fii primul care știe.</p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2 glow-violet">
              EXPLOREAZĂ SHOP-UL <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
