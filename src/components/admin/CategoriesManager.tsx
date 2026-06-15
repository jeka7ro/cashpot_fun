"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
  active: boolean;
};

export default function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });
  const [showNew, setShowNew] = useState(false);

  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const save = async (id: string, data: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Salvat");
      router.refresh();
      setEditId(null);
    } else toast.error("Eroare");
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Șterge "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Șters"); router.refresh(); }
    else toast.error("Eroare");
  };

  const create = async () => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
    if (res.ok) {
      toast.success("Categorie creată");
      setNewCat({ name: "", slug: "", description: "" });
      setShowNew(false);
      router.refresh();
    } else toast.error("Eroare");
  };

  return (
    <div className="max-w-2xl space-y-3">
      {categories.map((cat) =>
        editId === cat.id ? (
          <div key={cat.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-violet-500/30 space-y-3 shadow-sm dark:shadow-none">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Nume</label>
                <input
                  value={cat.name}
                  onChange={(e) =>
                    setCategories((cs) => cs.map((c) => c.id === cat.id ? { ...c, name: e.target.value } : c))
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Slug URL</label>
                <input
                  value={cat.slug}
                  onChange={(e) =>
                    setCategories((cs) => cs.map((c) => c.id === cat.id ? { ...c, slug: e.target.value } : c))
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Descriere</label>
              <input
                value={cat.description || ""}
                onChange={(e) =>
                  setCategories((cs) => cs.map((c) => c.id === cat.id ? { ...c, description: e.target.value } : c))
                }
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => save(cat.id, cat)} className="flex items-center gap-1 bg-violet-500 hover:bg-violet-400 text-white dark:text-black font-bold px-4 py-2 rounded-xl text-sm">
                <Check size={14} /> Salvează
              </button>
              <button onClick={() => setEditId(null)} className="flex items-center gap-1 border border-gray-300 text-gray-700 dark:border-white/20 dark:text-white px-4 py-2 rounded-xl text-sm">
                <X size={14} /> Anulează
              </button>
            </div>
          </div>
        ) : (
          <div key={cat.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${cat.active ? "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40"}`}>
                  {cat.active ? "activ" : "inactiv"}
                </span>
              </div>
              <p className="text-gray-500 dark:text-white/40 text-xs font-mono">/shop?category={cat.slug}</p>
              {cat.description && <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">{cat.description}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => save(cat.id, { active: !cat.active })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${cat.active ? "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:bg-white/10 dark:text-white/50 dark:hover:bg-red-400/10 dark:hover:text-red-400" : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20"}`}
              >
                {cat.active ? "Dezactivează" : "Activează"}
              </button>
              <button onClick={() => setEditId(cat.id)} className="p-2 text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white transition">
                <Pencil size={16} />
              </button>
              <button onClick={() => del(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-600 dark:text-white/40 dark:hover:text-red-400 transition">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      )}

      {showNew ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-violet-500/30 space-y-3 shadow-sm dark:shadow-none">
          <h3 className="font-semibold text-gray-900 dark:text-white">Categorie nouă</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Nume</label>
              <input
                value={newCat.name}
                onChange={(e) => setNewCat((n) => ({ ...n, name: e.target.value, slug: n.slug || slugify(e.target.value) }))}
                placeholder="Ex: Tricouri"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Slug</label>
              <input
                value={newCat.slug}
                onChange={(e) => setNewCat((n) => ({ ...n, slug: e.target.value }))}
                placeholder="ex: tricouri"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none font-mono placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
          <input
            value={newCat.description}
            onChange={(e) => setNewCat((n) => ({ ...n, description: e.target.value }))}
            placeholder="Descriere (opțional)"
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <button onClick={create} className="flex items-center gap-1 bg-violet-500 hover:bg-violet-400 text-white dark:text-black font-bold px-4 py-2 rounded-xl text-sm">
              <Check size={14} /> Creează
            </button>
            <button onClick={() => setShowNew(false)} className="flex items-center gap-1 border border-gray-300 text-gray-700 dark:border-white/20 dark:text-white px-4 py-2 rounded-xl text-sm">
              <X size={14} /> Anulează
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-violet-500/50 dark:border-white/20 dark:hover:border-violet-500/50 rounded-2xl py-4 text-gray-500 hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-500 transition text-sm font-medium bg-white/50 dark:bg-transparent"
        >
          <Plus size={18} /> Adaugă categorie
        </button>
      )}
    </div>
  );
}
