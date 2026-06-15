"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";
import Image from "next/image";
import { X, Plus } from "lucide-react";

type ImageObj = {
  url: string;
  color?: string;
};

type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  images: ImageObj[];
  inventory: Record<string, number> | string;
  primaryColor: string | null;
  stock: number;
  published: boolean;
  featured: boolean;
};

const CATEGORIES = ["tricouri", "hanorace", "accesorii", "alte"];
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = ["Negru", "Alb", "Gri", "Navy", "Verde", "Roșu"];

const Input = ({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; required?: boolean;
}) => (
  <div>
    <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
    />
  </div>
);

export default function ProductForm({ 
  initial,
  categories = []
}: { 
  initial?: Partial<Product>;
  categories?: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [useAdvancedInventory, setUseAdvancedInventory] = useState(
    initial?.inventory && typeof initial?.inventory === "string" 
      ? Object.keys(JSON.parse(initial.inventory)).length > 0 
      : Object.keys(initial?.inventory || {}).length > 0
  );

  const defaultCategory = categories.length > 0 ? categories[0].slug : "tricouri";

  const [form, setForm] = useState<Product>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    price: initial?.price || 0,
    comparePrice: initial?.comparePrice || undefined,
    category: initial?.category || defaultCategory,
    sizes: initial?.sizes || [],
    colors: initial?.colors || [],
    images: (initial?.images as any[])?.map((img: any) => typeof img === "string" ? { url: img } : img) || [],
    inventory: (initial?.inventory && typeof initial?.inventory === "string" ? JSON.parse(initial.inventory) : initial?.inventory) || {},
    primaryColor: initial?.primaryColor || null,
    stock: initial?.stock || 0,
    published: initial?.published ?? false,
    featured: initial?.featured ?? false,
  });

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  const set = (key: keyof Product, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slug || slugify(name),
    }));
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    
    let hasError = false;
    const uploadedImages = await Promise.all(files.map(async (file) => {
      const data = new FormData();
      data.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const json = await res.json();
        if (json.url) return { url: json.url, color: "" };
      } catch (err) {}
      hasError = true;
      return null;
    }));

    const validImages = uploadedImages.filter((img): img is { url: string; color: string } => img !== null);
    if (hasError) toast.error("Unele imagini nu au putut fi încărcate");
    
    setForm((f) => ({ ...f, images: [...f.images, ...validImages] }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = initial?.id ? `/api/products/${initial.id}` : "/api/products";
    const method = initial?.id ? "PATCH" : "POST";
    
    const totalStock = useAdvancedInventory 
      ? Object.values(form.inventory).reduce((acc: number, val) => acc + (Number(val) || 0), 0)
      : form.stock;
      
    const finalInventory = useAdvancedInventory ? form.inventory : {};

    const bodyToSubmit = {
      ...form,
      stock: totalStock,
      inventory: JSON.stringify(finalInventory)
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyToSubmit),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(initial?.id ? "Produs actualizat!" : "Produs creat!");
      router.push("/admin/products");
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "Eroare");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Nume produs *" value={form.name} onChange={handleNameChange} required />
        <Input label="Slug URL" value={form.slug} onChange={(v) => set("slug", v)} />
      </div>

      <div>
        <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">Descriere</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input label="Preț (RON) *" type="number" value={form.price} onChange={(v) => set("price", parseFloat(v) || 0)} required />
        <Input label="Preț vechi (opțional)" type="number" value={form.comparePrice || ""} onChange={(v) => set("comparePrice", parseFloat(v) || null)} />
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">Stoc Global</label>
          <input
            type="number"
            value={useAdvancedInventory ? Object.values(form.inventory).reduce((acc: number, val) => acc + (Number(val) || 0), 0) : form.stock}
            onChange={(e) => set("stock", parseInt(e.target.value) || 0)}
            disabled={useAdvancedInventory}
            className={`w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${useAdvancedInventory ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-900 dark:text-white focus:border-violet-500"}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">Categorie</label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition"
        >
          {categories.length > 0 ? categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          )) : (
            CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))
          )}
        </select>
      </div>

      {form.colors.length > 0 && (
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">Culoare Prezentare (Copertă)</label>
          <select
            value={form.primaryColor || ""}
            onChange={(e) => set("primaryColor", e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition"
          >
            <option value="">Alege culoarea de afișat în magazin</option>
            {form.colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sizes */}
      <div>
        <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-2">Mărimi</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {DEFAULT_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("sizes", form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s])}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                form.sizes.includes(s) ? "border-violet-500 text-violet-600 dark:text-violet-500 bg-violet-50 dark:bg-transparent" : "border-gray-200 text-gray-500 dark:border-white/20 dark:text-white/50 hover:border-gray-400 dark:hover:border-white/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Adaugă mărime custom..."
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => { if (sizeInput.trim()) { set("sizes", [...form.sizes, sizeInput.trim()]); setSizeInput(""); } }}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-xl transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-2">Culori</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("colors", form.colors.includes(c) ? form.colors.filter((x) => x !== c) : [...form.colors, c])}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                form.colors.includes(c) ? "border-violet-500 text-violet-600 dark:text-violet-500 bg-violet-50 dark:bg-transparent" : "border-gray-200 text-gray-500 dark:border-white/20 dark:text-white/50 hover:border-gray-400 dark:hover:border-white/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Adaugă culoare custom..."
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => { if (colorInput.trim()) { set("colors", [...form.colors, colorInput.trim()]); setColorInput(""); } }}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-xl transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Inventory Matrix */}
      {(form.sizes.length > 0 || form.colors.length > 0) && (
        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/10">
          <label className="flex items-center gap-3 cursor-pointer mb-2">
            <div
              onClick={() => setUseAdvancedInventory(!useAdvancedInventory)}
              className={`w-11 h-6 rounded-full transition ${useAdvancedInventory ? "bg-violet-600 dark:bg-violet-500" : "bg-gray-300 dark:bg-zinc-700"} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useAdvancedInventory ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-white/90">Folosește stoc avansat pe variante (Culoare & Mărime)</span>
          </label>
          
          {useAdvancedInventory && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-white/50">
                  <tr>
                    <th className="px-4 py-2 rounded-tl-lg">Culoare</th>
                    <th className="px-4 py-2">Mărime</th>
                    <th className="px-4 py-2 rounded-tr-lg">Stoc</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.colors.length > 0 ? form.colors : ["Standard"]).map(color => (
                    (form.sizes.length > 0 ? form.sizes : ["O mărime"]).map(size => {
                      const key = `${color}_${size}`;
                      return (
                        <tr key={key} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                          <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{color}</td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{size}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={form.inventory[key] || ""}
                              onChange={(e) => {
                                const v = parseInt(e.target.value) || 0;
                                set("inventory", { ...form.inventory, [key]: v });
                              }}
                              className="w-20 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Images */}
      <div>
        <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-2">Imagini & Video</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          {form.images.map((img, i) => {
            const isVideo = img.url.match(/\.(mp4|webm|ogg)$/i);
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-transparent">
                  {isVideo ? (
                    <video src={img.url} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                  ) : (
                    <Image src={img.url} alt="" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-red-500 transition"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
                <select
                  value={img.color || ""}
                  onChange={(e) => {
                    const newImages = [...form.images];
                    newImages[i].color = e.target.value;
                    set("images", newImages);
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-900 dark:text-white text-xs focus:border-violet-500 focus:outline-none transition"
                >
                  <option value="">Fără culoare</option>
                  {form.colors.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            );
          })}
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-violet-500 dark:border-white/20 dark:hover:border-violet-500/50 flex flex-col items-center justify-center cursor-pointer transition bg-gray-50 dark:bg-transparent">
            <input type="file" multiple accept="image/*,video/*" onChange={uploadImage} className="hidden" />
            {uploading ? (
              <span className="text-gray-500 dark:text-white/40 text-xs text-center px-2">Se încarcă...</span>
            ) : (
              <Plus size={24} className="text-gray-400 dark:text-white/30" />
            )}
          </label>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        {[
          { key: "published" as const, label: "Publicat (Live)" },
          { key: "featured" as const, label: "Featured (Recomandat)" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set(key, !form[key])}
              className={`w-11 h-6 rounded-full transition ${form[key] ? "bg-violet-600 dark:bg-violet-500" : "bg-gray-300 dark:bg-zinc-700"} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[key] ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-50 text-white dark:text-black font-bold px-8 py-3 rounded-xl text-sm tracking-wide transition shadow-sm"
        >
          {loading ? "Se salvează..." : initial?.id ? "ACTUALIZEAZĂ" : "CREEAZĂ PRODUS"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:hover:border-white/40 dark:text-white font-semibold px-8 py-3 rounded-xl text-sm transition"
        >
          Anulează
        </button>
      </div>
    </form>
  );
}
