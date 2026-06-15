import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
  });

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white text-sm mb-6 transition">
        <ArrowLeft size={16} /> Înapoi la produse
      </Link>
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">PRODUS NOU</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
