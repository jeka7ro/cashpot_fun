"use client";

import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <div className="glass-card p-12 mb-6" style={{ borderRadius: 32 }}>
          <ShoppingBag size={48} className="mx-auto mb-4 text-violet-400/40" />
          <h1 className="text-3xl font-black mb-3">Coșul tău</h1>
          <p className="text-white/40 mb-8">Coșul este gol momentan.</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            SHOP NOW <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = 20;
  const subtotal = total();
  const orderTotal = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight mb-10">
        COȘ <span className="text-white/30 text-2xl font-normal ml-2">({items.length})</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card flex gap-4 p-4" style={{ borderRadius: 24 }}>
              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden"
                style={{ borderRadius: 16, background: "rgba(255,255,255,0.05)" }}>
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                <div className="flex gap-2 text-xs text-white/40 mt-1">
                  {item.size && <span className="glass px-2 py-0.5" style={{ borderRadius: 6 }}>{item.size}</span>}
                  {item.color && <span className="glass px-2 py-0.5" style={{ borderRadius: 6 }}>{item.color}</span>}
                </div>
                <p className="text-violet-400 font-bold mt-2">{formatPrice(item.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition p-1">
                  <Trash2 size={15} />
                </button>
                <div className="glass flex items-center" style={{ borderRadius: 12 }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:text-violet-400 transition">
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-bold w-7 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-violet-400 transition">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass-card p-6 h-fit sticky top-24" style={{ borderRadius: 28 }}>
          <h2 className="font-bold text-base mb-6 tracking-wide">SUMAR</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-white/50">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Livrare</span><span>{formatPrice(shipping)}</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="pt-3 flex justify-between font-black text-base">
              <span>Total</span>
              <span className="text-violet-400">{formatPrice(orderTotal)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary block text-center glow-violet">
            FINALIZEAZĂ
          </Link>
          <Link href="/shop" className="block text-center text-white/30 hover:text-white/60 text-xs mt-4 transition">
            Continuă cumpărăturile
          </Link>
        </div>
      </div>
    </div>
  );
}
