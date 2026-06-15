import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

// Unsplash fashion/streetwear images (free, no auth needed)
const PRODUCT_IMAGES: Record<string, string[]> = {
  "cashpot-classic-tee": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1503341733017-1901578f9f1e?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
  ],
  "cashpot-logo-hoodie": [
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80",
  ],
  "cashpot-cap": [
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80",
  ],
};

async function main() {
  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      await prisma.product.update({
        where: { slug },
        data: { images: JSON.stringify(images) },
      });
      console.log(`✅ Imagini adăugate: ${product.name}`);
    }
  }
  console.log("Gata!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
