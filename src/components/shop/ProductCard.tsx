"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string;
  category: string;
  primaryColor?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const imagesRaw = JSON.parse(product.images);
  const images = imagesRaw.map((img: any) => typeof img === "string" ? { url: img, color: "" } : img);
  
  const primaryImage = product.primaryColor 
    ? images.find((img: any) => img.color === product.primaryColor) 
    : images[0];
    
  const mainImage = primaryImage?.url || images[0]?.url || null;
  const isVideo = mainImage?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div
        className="relative overflow-hidden aspect-square mb-3"
        style={{
          borderRadius: 24,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "all 0.3s ease",
        }}
      >
        {mainImage ? (
          isVideo ? (
            <video
              src={mainImage}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ transition: "transform 0.5s cubic-bezier(.4,0,.2,1)" }}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ transition: "transform 0.5s cubic-bezier(.4,0,.2,1)" }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(10,10,20,0.5))" }}>
            <ShoppingBag size={36} className="text-violet-500/40" />
            <span className="text-white/20 text-xs font-medium">Fără imagine</span>
          </div>
        )}

        {/* Hover overlay removed for clarity */}

        {/* SALE badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              borderRadius: 9999,
              boxShadow: "0 2px 12px rgba(124,58,237,0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            SALE
          </span>
        )}

        {/* Border glow on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(124,58,237,0.4)" }}
        />
      </div>

      {/* Info */}
      <div className="px-1">
        <p className="text-violet-400/60 text-[10px] uppercase tracking-[0.2em] mb-1 font-medium">{product.category}</p>
        <h3 className="text-white/90 font-semibold text-sm group-hover:text-violet-300 transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-white font-bold">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-white/30 line-through text-sm">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
