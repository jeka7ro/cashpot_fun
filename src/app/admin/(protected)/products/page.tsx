import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">PRODUSE</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white dark:text-black font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
        >
          <Plus size={16} /> PRODUS NOU
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 dark:text-white/40 text-xs border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
              <th className="text-left p-4 font-semibold">Produs</th>
              <th className="text-left p-4 hidden md:table-cell font-semibold">Categorie</th>
              <th className="text-left p-4 font-semibold">Preț</th>
              <th className="text-left p-4 hidden md:table-cell font-semibold">Stoc</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {products.map((p) => {
              const rImgsRaw = JSON.parse(p.images);
              const images = rImgsRaw.map((img: any) => typeof img === "string" ? { url: img } : img);
              return (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 border border-gray-200 dark:border-transparent">
                        {images[0] ? (
                          <Image src={images[0].url} alt={p.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-gray-500 dark:text-white/40 text-xs">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-500 dark:text-white/60">{p.category}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{formatPrice(p.price)}</td>
                  <td className="p-4 hidden md:table-cell text-gray-500 dark:text-white/60">{p.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.published
                        ? "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50"
                    }`}>
                      {p.published ? "LIVE" : "DRAFT"}
                    </span>
                    {p.featured && (
                      <span className="ml-1 px-2 py-1 rounded text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-500">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white transition"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500 dark:text-white/30">
                  Niciun produs. <Link href="/admin/products/new" className="text-violet-600 dark:text-violet-500 hover:underline">Adaugă primul produs</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
