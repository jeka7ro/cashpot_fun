"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import toast from "react-hot-toast";

type ImageObj = { url: string; color?: string };

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    images: string;
    sizes: string;
    colors: string;
    inventory?: string;
    primaryColor?: string | null;
    stock: number;
    category: string;
    description: string;
    sku?: string | null;
  };
};

export default function ProductInteractive({ product }: Props) {
  const addItem = useCart((s) => s.addItem);

  const sizes = JSON.parse(product.sizes || "[]") as string[];
  const colors = JSON.parse(product.colors || "[]") as string[];
  const rawImages = JSON.parse(product.images || "[]");
  const inventory = JSON.parse(product.inventory || "{}") as Record<string, number>;

  const images: ImageObj[] = rawImages.map((img: any) =>
    typeof img === "string" ? { url: img, color: "" } : img
  );

  const defaultColor = product.primaryColor || colors[0] || "";
  const defaultSize = sizes[0] || "";

  const getDefaultImageIndex = () => {
    if (defaultColor) {
      const idx = images.findIndex((img) => img.color === defaultColor);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  };

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [imgIndex, setImgIndex] = useState(getDefaultImageIndex());
  const [added, setAdded] = useState(false);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const idx = images.findIndex((img) => img.color === color);
    if (idx >= 0) setImgIndex(idx);
  };

  const curImg = images[imgIndex];

  const variantKey = `${selectedColor || "Standard"}_${selectedSize || "O mărime"}`;
  const hasInventory = Object.keys(inventory).length > 0;
  const outOfStock = hasInventory ? (inventory[variantKey] || 0) <= 0 : product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: curImg?.url || "",
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success("Adăugat în coș!");
  };

  const fmt = (p: number) =>
    new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(p);

  const pct = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    /* Extra bottom padding for the fixed cart bar */
    <div style={{ paddingBottom: 100 }}>

      {/* ── MOBILE SELECTORS (visible at top, before image) ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "rgba(124,58,237,0.7)", textTransform: "uppercase", letterSpacing: "0.25em", fontWeight: 700, marginBottom: 6 }}>
          {product.category}
        </p>
        <h1 style={{ fontSize: "clamp(22px,6vw,38px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.15 }}>
          {product.name}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 26, fontWeight: 900 }}>{fmt(product.price)}</span>
          {pct && (
            <>
              <span style={{ color: "rgba(255,255,255,0.3)", textDecoration: "line-through", fontSize: 18 }}>
                {fmt(product.comparePrice!)}
              </span>
              <span style={{ background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                -{pct}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN on desktop, single column on mobile ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>

        {/* ── IMAGE ── */}
        <div>
          {/* Main image - plain <img> tag, no fill */}
          {curImg ? (
            curImg.url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={curImg.url}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 24, display: "block" }}
                muted loop playsInline autoPlay
              />
            ) : (
              <img
                src={curImg.url}
                alt={product.name}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 24, display: "block", border: "1px solid rgba(255,255,255,0.07)" }}
              />
            )
          ) : (
            <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>Fără imagine</span>
            </div>
          )}

          {/* Thumbnails - plain <img>, no Next.js Image fill */}
          {images.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 10 }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImgIndex(i)}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: imgIndex === i ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
                    opacity: imgIndex === i ? 1 : 0.55,
                    aspectRatio: "1/1",
                  }}
                >
                  {img.url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={img.url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} muted loop playsInline />
                  ) : (
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SELECTORS ── */}
        <div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* SIZES */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, marginBottom: 10 }}>
                Mărime
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      border: selectedSize === size ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.15)",
                      background: selectedSize === size ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)",
                      color: selectedSize === size ? "#a78bfa" : "rgba(255,255,255,0.6)",
                      outline: "none",
                      WebkitAppearance: "none",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLORS */}
          {colors.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, marginBottom: 10 }}>
                Culoare — <span style={{ color: "#a78bfa" }}>{selectedColor}</span>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      border: selectedColor === color ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.15)",
                      background: selectedColor === color ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)",
                      color: selectedColor === color ? "#a78bfa" : "rgba(255,255,255,0.6)",
                      outline: "none",
                      WebkitAppearance: "none",
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DESKTOP Add to Cart */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: "0.05em",
              borderRadius: 9999,
              padding: "16px 24px",
              border: "none",
              cursor: outOfStock ? "not-allowed" : "pointer",
              background: added ? "#16a34a" : outOfStock ? "#3f3f46" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              opacity: outOfStock ? 0.5 : 1,
              outline: "none",
              WebkitAppearance: "none",
            }}
          >
            <ShoppingCart size={18} />
            {outOfStock ? "STOC EPUIZAT" : added ? "✓ ADĂUGAT!" : "ADAUGĂ ÎN COȘ"}
          </button>

          {/* Trust badges */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { icon: "📦", text: "Livrare 2-5 zile lucrătoare" },
              { icon: "↩️", text: "Retur gratuit în 30 de zile" },
              { icon: "✅", text: "Calitate premium garantată" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 8 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
