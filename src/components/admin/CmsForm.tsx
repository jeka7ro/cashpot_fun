"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { SiteSettings } from "@/lib/settings";

type Tab = "brand" | "hero" | "announcement" | "shipping" | "seo" | "social";

const TABS: { id: Tab; label: string }[] = [
  { id: "brand", label: "Brand & Contact" },
  { id: "hero", label: "Hero (Prima pagină)" },
  { id: "announcement", label: "Banner anunț" },
  { id: "shipping", label: "Livrare" },
  { id: "social", label: "Social Media" },
  { id: "seo", label: "SEO" },
];

const Field = ({
  label, value, onChange, type = "text", placeholder = "", hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) => (
  <div>
    <label className="block text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-1">{label}</label>
    {type === "textarea" ? (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    ) : type === "toggle" ? (
      <div
        onClick={() => onChange(value === "true" ? "false" : "true")}
        className={`w-11 h-6 rounded-full cursor-pointer transition relative ${value === "true" ? "bg-violet-600 dark:bg-violet-500" : "bg-gray-200 dark:bg-zinc-700"}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value === "true" ? "left-6" : "left-1"}`} />
      </div>
    ) : type === "color" ? (
      <div className="flex gap-3 items-center">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition font-mono"
        />
      </div>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    )}
    {hint && <p className="text-gray-500 dark:text-white/30 text-xs mt-1">{hint}</p>}
  </div>
);

export default function CmsForm({ settings }: { settings: SiteSettings }) {
  const [values, setValues] = useState<SiteSettings>({ ...settings });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("brand");

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) toast.success("Setări salvate! Reîncarcă site-ul pentru a vedea modificările.");
    else toast.error("Eroare la salvare");
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-white dark:bg-zinc-900 p-1 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.id ? "bg-violet-600 text-white dark:bg-violet-500 dark:text-black shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
        {tab === "brand" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">BRAND & CONTACT</h2>
            <Field label="Numele brandului" value={values["site.name"]} onChange={(v) => set("site.name", v)} placeholder="CASHPOT" />
            <Field label="Tagline / Slogan" value={values["site.tagline"]} onChange={(v) => set("site.tagline", v)} placeholder="Merch original..." />
            <Field label="Email contact" value={values["site.email"]} onChange={(v) => set("site.email", v)} type="email" />
            <Field label="Telefon" value={values["site.phone"]} onChange={(v) => set("site.phone", v)} />
            <Field label="Adresă" value={values["site.address"]} onChange={(v) => set("site.address", v)} />
            <Field label="Text footer" value={values["footer.text"]} onChange={(v) => set("footer.text", v)} type="textarea" />
          </div>
        )}

        {tab === "hero" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">HERO — PRIMA PAGINĂ</h2>
            <Field label="Badge text (ex: Limited Drop)" value={values["hero.badge"]} onChange={(v) => set("hero.badge", v)} />
            <Field label="Subtitlu" value={values["hero.subtitle"]} onChange={(v) => set("hero.subtitle", v)} type="textarea" />
            <Field label="Text buton 1 (Shop)" value={values["hero.cta1"]} onChange={(v) => set("hero.cta1", v)} />
            <Field label="Text buton 2 (Featured)" value={values["hero.cta2"]} onChange={(v) => set("hero.cta2", v)} />
          </div>
        )}

        {tab === "announcement" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">BANNER ANUNȚ (sus)</h2>
            <div className="flex items-center gap-3">
              <Field label="Banner activ" value={values["announcement.active"]} onChange={(v) => set("announcement.active", v)} type="toggle" />
              <span className="text-sm text-gray-500 dark:text-white/50 mt-5">
                {values["announcement.active"] === "true" ? "Afișat" : "Ascuns"}
              </span>
            </div>
            <Field
              label="Text banner"
              value={values["announcement.text"]}
              onChange={(v) => set("announcement.text", v)}
              type="textarea"
              placeholder="🚚 Livrare gratuită la comenzi peste 200 RON"
            />
            <Field label="Culoare fundal banner" value={values["announcement.bg"]} onChange={(v) => set("announcement.bg", v)} type="color" />
            <Field label="Culoare text banner" value={values["announcement.color"]} onChange={(v) => set("announcement.color", v)} type="color" />
            <div className="mt-4 p-3 rounded-xl text-sm font-semibold text-center"
              style={{
                backgroundColor: values["announcement.bg"] || "#7c3aed",
                color: values["announcement.color"] || "#000",
              }}>
              Preview: {values["announcement.text"] || "Text banner"}
            </div>
          </div>
        )}

        {tab === "shipping" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">SETĂRI LIVRARE</h2>
            <Field
              label="Cost livrare (RON)"
              value={values["shipping.price"]}
              onChange={(v) => set("shipping.price", v)}
              type="number"
              hint="Costul standard de livrare"
            />
            <Field
              label="Livrare gratuită peste (RON)"
              value={values["shipping.freeAbove"]}
              onChange={(v) => set("shipping.freeAbove", v)}
              type="number"
              hint="Pune 0 pentru a dezactiva livrarea gratuită"
            />
            <Field
              label="Zile estimative livrare"
              value={values["shipping.estimatedDays"]}
              onChange={(v) => set("shipping.estimatedDays", v)}
              placeholder="2-5"
              hint="Afișat pe site (ex: '2-5' sau '24-48 ore')"
            />
          </div>
        )}

        {tab === "social" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">SOCIAL MEDIA</h2>
            <Field label="Instagram URL" value={values["site.instagram"]} onChange={(v) => set("site.instagram", v)} placeholder="https://instagram.com/..." />
            <Field label="TikTok URL" value={values["site.tiktok"]} onChange={(v) => set("site.tiktok", v)} placeholder="https://tiktok.com/@..." />
            <Field label="Facebook URL" value={values["site.facebook"]} onChange={(v) => set("site.facebook", v)} placeholder="https://facebook.com/..." />
            <Field label="YouTube URL" value={values["site.youtube"]} onChange={(v) => set("site.youtube", v)} placeholder="https://youtube.com/..." />
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-gray-900 dark:text-white">SEO</h2>
            <Field
              label="Titlu pagina principală"
              value={values["seo.title"]}
              onChange={(v) => set("seo.title", v)}
              hint="Apare în tab-ul browserului și Google (max 60 caractere)"
            />
            <Field
              label="Meta descriere"
              value={values["seo.description"]}
              onChange={(v) => set("seo.description", v)}
              type="textarea"
              hint="Descrierea din rezultatele Google (max 160 caractere)"
            />
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={save}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-50 text-white dark:text-black font-bold px-8 py-3 rounded-xl text-sm tracking-wide transition shadow-sm"
          >
            {loading ? "Se salvează..." : "SALVEAZĂ MODIFICĂRILE"}
          </button>
        </div>
      </div>
    </div>
  );
}
