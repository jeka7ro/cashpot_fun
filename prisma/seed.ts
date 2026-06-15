import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@cashpot.fun";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.admin.create({ data: { email, password: hashed, name } });
    console.log(`✅ Admin creat: ${email} / ${password}`);
  } else {
    console.log(`ℹ️  Admin deja există: ${email}`);
  }

  const products = [
    {
      name: "CASHPOT Classic Tee",
      slug: "cashpot-classic-tee",
      description: "Tricoul clasic CASHPOT din bumbac 100% premium. Fit relaxed, perfect pentru orice ocazie.",
      price: 149,
      comparePrice: 179,
      category: "tricouri",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negru", "Alb"],
      images: [],
      stock: 50,
      published: true,
      featured: true,
    },
    {
      name: "CASHPOT Logo Hoodie",
      slug: "cashpot-logo-hoodie",
      description: "Hanoracul iconic CASHPOT cu logo brodat. 380g/m² fleece heavyweight.",
      price: 299,
      comparePrice: null,
      category: "hanorace",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negru", "Gri"],
      images: [],
      stock: 30,
      published: true,
      featured: true,
    },
    {
      name: "CASHPOT Cap",
      slug: "cashpot-cap",
      description: "Șapcă cu cozoroc structurată, broderie logo față. Ajustabilă.",
      price: 89,
      comparePrice: null,
      category: "accesorii",
      sizes: [],
      colors: ["Negru", "Alb"],
      images: [],
      stock: 100,
      published: true,
      featured: false,
    },
  ];

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.product.create({
        data: {
          ...p,
          sizes: JSON.stringify(p.sizes),
          colors: JSON.stringify(p.colors),
          images: JSON.stringify(p.images),
        },
      });
      console.log(`✅ Produs creat: ${p.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
