import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import ProductInteractive from "@/components/shop/ProductInteractive";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Package } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: `${product.name} — CASHPOT` };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug, published: true } });
  if (!product) notFound();

  const rawImages = JSON.parse(product.images);
  const images = rawImages.map((img: any) => typeof img === "string" ? { url: img, color: "" } : img) as { url: string, color?: string }[];
  const related = await prisma.product.findMany({
    where: { published: true, category: product.category, NOT: { id: product.id } },
    take: 4,
  });

  const ImagePlaceholder = () => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
      style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(10,10,20,0.6) 100%)" }}
    >
      <ShoppingBag size={48} className="text-violet-500/30" />
      <p className="text-white/20 text-sm font-medium">Fără imagine</p>
      <p className="text-white/10 text-xs">Adaugă din admin</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/shop"
        className="inline-flex items-center gap-2 text-white/30 hover:text-violet-400 text-sm mb-8 transition">
        <ArrowLeft size={15} /> Înapoi la shop
      </Link>

      <ProductInteractive product={product as any} />

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <p className="text-violet-400/40 text-[10px] tracking-[0.3em] uppercase mb-2">S-ar putea să-ți placă</p>
          <h2 className="text-2xl font-black mb-8">PRODUSE SIMILARE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => {
              const rImgsRaw = JSON.parse(p.images);
              const imgs = rImgsRaw.map((img: any) => typeof img === "string" ? { url: img } : img);
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="group">
                  <div
                    className="relative aspect-square overflow-hidden mb-3"
                    style={{ borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {imgs[0] ? (
                      <Image src={imgs[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package size={28} className="text-violet-500/20" />
                      </div>
                    )}
                  </div>
                  <p className="text-white/80 text-sm font-semibold group-hover:text-violet-400 transition">{p.name}</p>
                  <p className="text-white/40 text-sm mt-0.5">{formatPrice(p.price)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
