"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Copy } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

const blank = {
  code: "",
  type: "percent",
  value: 10,
  minOrder: "",
  maxUses: "",
  expiresAt: "",
};

export default function CouponsManager({ coupons: initial }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const create = async () => {
    setLoading(true);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(String(form.value)),
        minOrder: form.minOrder ? parseFloat(String(form.minOrder)) : null,
        maxUses: form.maxUses ? parseInt(String(form.maxUses)) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Cod creat!");
      setForm(blank);
      setShowForm(false);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "Eroare");
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    router.refresh();
  };

  const del = async (id: string, code: string) => {
    if (!confirm(`Șterge codul "${code}"?`)) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    toast.success("Cod șters");
    router.refresh();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Cod copiat!");
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden mb-4 shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 dark:text-white/30 text-xs border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-transparent">
              <th className="text-left p-4 font-semibold">Cod</th>
              <th className="text-left p-4 hidden md:table-cell font-semibold">Tip</th>
              <th className="text-left p-4 font-semibold">Valoare</th>
              <th className="text-left p-4 hidden sm:table-cell font-semibold">Utilizări</th>
              <th className="text-left p-4 hidden lg:table-cell font-semibold">Expiră</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {initial.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-violet-600 dark:text-violet-500">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-900 dark:text-white/30 dark:hover:text-white transition">
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-gray-500 dark:text-white/60 capitalize">{c.type}</td>
                <td className="p-4 font-bold text-gray-900 dark:text-white">
                  {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  {c.minOrder && <span className="text-gray-400 dark:text-white/30 text-xs ml-1 font-normal">(min {formatPrice(c.minOrder)})</span>}
                </td>
                <td className="p-4 hidden sm:table-cell text-gray-500 dark:text-white/60">
                  {c.usedCount}/{c.maxUses || "∞"}
                </td>
                <td className="p-4 hidden lg:table-cell text-gray-400 dark:text-white/40 text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("ro-RO") : "—"}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${c.active ? "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40"}`}>
                    {c.active ? "ACTIV" : "INACTIV"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => toggle(c.id, !c.active)} className="text-xs text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white mr-3 transition">
                    {c.active ? "Dezactivează" : "Activează"}
                  </button>
                  <button onClick={() => del(c.id, c.code)} className="text-gray-400 hover:text-red-600 dark:text-white/40 dark:hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-gray-400 dark:text-white/30">Niciun cod creat.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-violet-500/30 shadow-sm dark:shadow-none">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">COD NOU</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Codul promoțional *</label>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="Ex: SUMMER20"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white font-mono font-bold uppercase focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Tip reducere</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="percent">Procent (%)</option>
                <option value="fixed">Sumă fixă (RON)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">
                Valoare ({form.type === "percent" ? "%" : "RON"}) *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Comandă minimă (RON)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => set("minOrder", e.target.value)}
                placeholder="Opțional"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Utilizări maxime</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
                placeholder="Nelimitat"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs uppercase mb-1 block">Data expirare</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} disabled={loading} className="bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white dark:text-black font-bold px-6 py-2.5 rounded-xl text-sm transition">
              {loading ? "Se creează..." : "CREEAZĂ COD"}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5 px-6 py-2.5 rounded-xl text-sm transition">
              Anulează
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white dark:text-black font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm"
        >
          <Plus size={16} /> COD NOU
        </button>
      )}
    </div>
  );
}
