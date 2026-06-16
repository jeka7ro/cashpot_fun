import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  searchParams: Promise<{ category?: string; featured?: string; tag?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: Props) {
  const { category, featured, tag } = await searchParams;

  const where: any = { published: true };
  if (category) where.category = category;
  if (featured === "1") where.featured = true;
  if (tag) where.tags = { contains: `"${tag}"` };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-violet-400 text-sm mb-8 transition">
        <ArrowLeft size={15} /> Înapoi acasă
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">
            {tag ? tag : category ? category : featured === "1" ? "Featured Drops" : "TOATE PRODUSELE"}
          </h1>
          <p className="text-white/40 mt-2 text-sm">{products.length} produse găsite</p>
        </div>

        {/* Categories filter */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/shop"
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${!category && !featured ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            TOATE
          </Link>
          {categories.map(c => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition uppercase ${category === c.slug ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p as any} />)}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-white/30 text-lg">Nu am găsit produse pentru această selecție.</p>
        </div>
      )}
    </div>
  );
}
