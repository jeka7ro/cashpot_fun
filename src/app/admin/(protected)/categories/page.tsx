import { prisma } from "@/lib/prisma";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">CATEGORII</h1>
        <p className="text-gray-500 dark:text-white/40 text-sm mt-1">Gestionează categoriile de produse</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
