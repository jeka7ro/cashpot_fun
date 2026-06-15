import sharp from "sharp";
import path from "path";
import fs from "fs";
import https from "https";
import http from "http";

const UPLOADS = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });

async function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function makeMockup(
  productUrl: string,
  logoUrl: string,
  outName: string,
  opts: { logoWidthPercent?: number; position?: "center" | "chest" | "front" } = {}
): Promise<string> {
  const logoWidthPercent = opts.logoWidthPercent ?? 35;

  console.log(`  Descărcând produs: ${productUrl.substring(0, 60)}...`);
  const productBuf = await fetchBuffer(productUrl);

  console.log(`  Descărcând logo...`);
  const logoBuf = await fetchBuffer(logoUrl);

  // Get product dimensions
  const productMeta = await sharp(productBuf).metadata();
  const W = productMeta.width || 800;
  const H = productMeta.height || 800;

  // Resize logo
  const logoW = Math.round(W * (logoWidthPercent / 100));
  const resizedLogo = await sharp(logoBuf)
    .resize(logoW, undefined, { fit: "inside" })
    .toBuffer();

  const logoMeta = await sharp(resizedLogo).metadata();
  const logoH = logoMeta.height || 100;

  // Position: chest area (40% from top, centered)
  const left = Math.round((W - logoW) / 2);
  const top = Math.round(H * 0.35);

  const outPath = path.join(UPLOADS, outName);

  await sharp(productBuf)
    .resize(800, 800, { fit: "cover", position: "center" })
    .composite([
      {
        input: resizedLogo,
        left,
        top,
        blend: "over",
      },
    ])
    .jpeg({ quality: 90 })
    .toFile(outPath);

  console.log(`  ✅ Salvat: ${outName}`);
  return `/uploads/${outName}`;
}

// ── Also make a version with semi-transparent logo for hoodie ──
async function makeMockupWithOpacity(
  productUrl: string,
  logoUrl: string,
  outName: string,
  logoWidthPercent = 40,
  opacity = 0.85
): Promise<string> {
  const productBuf = await fetchBuffer(productUrl);
  const logoBuf = await fetchBuffer(logoUrl);

  const productMeta = await sharp(productBuf).metadata();
  const W = productMeta.width || 800;
  const H = productMeta.height || 800;

  const logoW = Math.round(W * (logoWidthPercent / 100));
  const resizedLogo = await sharp(logoBuf)
    .resize(logoW, undefined, { fit: "inside" })
    .png()
    .toBuffer();

  // Apply opacity via composite with raw pixel manipulation
  const logoMeta = await sharp(resizedLogo).metadata();
  const logoH = logoMeta.height || 100;

  // Add opacity channel
  const opacityLogo = await sharp(resizedLogo)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = opacityLogo;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * opacity);
  }

  const finalLogo = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();

  const left = Math.round((W - logoW) / 2);
  const top = Math.round(H * 0.32);
  const outPath = path.join(UPLOADS, outName);

  await sharp(productBuf)
    .resize(800, 800, { fit: "cover", position: "center" })
    .composite([{ input: finalLogo, left, top, blend: "over" }])
    .jpeg({ quality: 90 })
    .toFile(outPath);

  console.log(`  ✅ Salvat: ${outName}`);
  return `/uploads/${outName}`;
}

const LOGO_URL = "https://cashpotdev.up.railway.app/logo_cashpot.png";

const PRODUCTS = [
  {
    slug: "cashpot-logo-hoodie",
    sources: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    ],
    outNames: ["hoodie-mockup-1.jpg", "hoodie-mockup-2.jpg"],
    logoPercent: 42,
  },
  {
    slug: "cashpot-cap",
    sources: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80",
    ],
    outNames: ["cap-mockup-1.jpg", "cap-mockup-2.jpg"],
    logoPercent: 28,
  },
  {
    slug: "cashpot-classic-tee",
    sources: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1503341733017-1901578f9f1e?w=800&q=80",
    ],
    outNames: ["tee-mockup-1.jpg", "tee-mockup-2.jpg"],
    logoPercent: 38,
  },
];

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const product of PRODUCTS) {
    console.log(`\n🎨 Generez mockup-uri: ${product.slug}`);
    const imgPaths: string[] = [];

    for (let i = 0; i < product.sources.length; i++) {
      try {
        const imgPath = await makeMockupWithOpacity(
          product.sources[i],
          LOGO_URL,
          product.outNames[i],
          product.logoPercent
        );
        imgPaths.push(imgPath);
      } catch (err) {
        console.error(`  ❌ Eroare la ${product.outNames[i]}:`, err);
      }
    }

    if (imgPaths.length > 0) {
      await prisma.product.update({
        where: { slug: product.slug },
        data: { images: JSON.stringify(imgPaths) },
      });
      console.log(`  📦 DB actualizat cu ${imgPaths.length} imagini`);
    }
  }

  console.log("\n✅ Toate mockup-urile generate!");
  await prisma.$disconnect();
}

main().catch(console.error);
