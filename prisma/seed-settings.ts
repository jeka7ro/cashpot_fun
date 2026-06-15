import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

const DEFAULTS: Record<string, string> = {
  // Brand
  "site.name": "CASHPOT",
  "site.tagline": "Merch original pentru oameni originali",
  "site.email": "contact@cashpot.ro",
  "site.phone": "+40 700 000 000",
  "site.address": "București, România",
  "site.instagram": "https://instagram.com/cashpot.ro",
  "site.tiktok": "https://tiktok.com/@cashpot.ro",
  // Hero
  "hero.badge": "Limited Drop",
  "hero.title": "CASH",
  "hero.titleAccent": "POT",
  "hero.subtitle": "Merch original pentru oameni originali. Calitate premium, design unic.",
  "hero.cta1": "SHOP NOW",
  "hero.cta2": "FEATURED DROPS",
  "hero.bgColor": "#000000",
  // Announcement bar
  "announcement.active": "true",
  "announcement.text": "🚚 Livrare gratuită la comenzi peste 200 RON · Retur 30 zile",
  "announcement.bg": "#eab308",
  "announcement.color": "#000000",
  // Shipping
  "shipping.price": "20",
  "shipping.freeAbove": "200",
  "shipping.estimatedDays": "2-5",
  // Footer
  "footer.text": "Merch original pentru oameni originali. Calitate premium, design unic.",
  // SEO
  "seo.title": "CASHPOT — Merch Store",
  "seo.description": "Merch original pentru oameni originali. Tricouri, hanorace și accesorii premium.",
};

async function main() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`✅ ${Object.keys(DEFAULTS).length} setări CMS create`);

  // Categories
  const cats = [
    { name: "Tricouri", slug: "tricouri", position: 1, active: true },
    { name: "Hanorace", slug: "hanorace", position: 2, active: true },
    { name: "Accesorii", slug: "accesorii", position: 3, active: true },
  ];
  for (const cat of cats) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log(`✅ ${cats.length} categorii create`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
