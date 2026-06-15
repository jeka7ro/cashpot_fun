import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
  });

  const rawImages = JSON.parse(product.images);
  const images = rawImages.map((img: any) => typeof img === "string" ? { url: img, color: "" } : img);

  const initial = {
    ...product,
    sizes: JSON.parse(product.sizes) as string[],
    colors: JSON.parse(product.colors) as string[],
    images,
  };

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white text-sm mb-6 transition">
        <ArrowLeft size={16} /> Înapoi la produse
      </Link>
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">EDITEAZĂ: {product.name}</h1>
      <ProductForm initial={initial} categories={categories} />
    </div>
  );
}
