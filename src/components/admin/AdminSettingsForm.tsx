"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsForm({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.next !== password.confirm) { toast.error("Parolele nu coincid"); return; }
    if (password.next.length < 6) { toast.error("Parola nouă trebuie să aibă minim 6 caractere"); return; }
    setLoading(true);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: password.current, next: password.next }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Parola schimbată!");
      setPassword({ current: "", next: "", confirm: "" });
    } else {
      const e = await res.json();
      toast.error(e.error || "Eroare");
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Account info */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
        <h2 className="font-bold mb-4 text-gray-900 dark:text-white">CONT ADMINISTRATOR</h2>
        <div className="space-y-3">
          <div>
            <label className="text-gray-500 dark:text-white/40 text-xs uppercase">Nume</label>
            <p className="text-gray-900 dark:text-white font-semibold mt-1">{adminName}</p>
          </div>
          <div>
            <label className="text-gray-500 dark:text-white/40 text-xs uppercase">Email</label>
            <p className="text-gray-900 dark:text-white font-semibold mt-1">{adminEmail}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
        <h2 className="font-bold mb-4 text-gray-900 dark:text-white">SCHIMBĂ PAROLA</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: "current" as const, label: "Parola curentă" },
            { key: "next" as const, label: "Parola nouă (min 6 caractere)" },
            { key: "confirm" as const, label: "Confirmă parola nouă" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">{label}</label>
              <input
                type="password"
                value={password[key]}
                onChange={(e) => setPassword((p) => ({ ...p, [key]: e.target.value }))}
                required
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-50 text-white dark:text-black font-bold py-3 rounded-xl text-sm tracking-wide transition shadow-sm"
          >
            {loading ? "Se salvează..." : "SCHIMBĂ PAROLA"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-zinc-900 rounded-2xl p-6 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-none">
        <h2 className="font-bold text-red-600 dark:text-red-400 mb-2">ZONĂ PERICULOASĂ</h2>
        <p className="text-red-800/60 dark:text-white/40 text-sm mb-4">Acțiunile de mai jos sunt ireversibile.</p>
        <a
          href="/api/orders/export"
          className="inline-block bg-white dark:bg-transparent border border-red-200 dark:border-white/20 hover:border-red-300 dark:hover:border-white/40 text-red-600 dark:text-white text-sm px-4 py-2 rounded-xl transition"
        >
          📊 Export toate comenzile (CSV)
        </a>
      </div>
    </div>
  );
}
