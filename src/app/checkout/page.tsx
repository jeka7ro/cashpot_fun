"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { Tag, X } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", postalCode: "", notes: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const shipping = 20;
  const subtotal = total();
  const orderTotal = Math.max(0, subtotal + shipping - discount);

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await res.json();
    setCouponLoading(false);
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    setDiscount(data.discount);
    setAppliedCode(couponCode.toUpperCase());
    toast.success(`Reducere ${formatPrice(data.discount)} aplicată!`);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCode("");
    setCouponCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          couponCode: appliedCode || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          subtotal,
          shipping,
          discount,
          total: orderTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");

      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
      } else {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eroare la plasarea comenzii");
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = "text", required = true) => (
    <div>
      <label className="block text-white/60 text-xs uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:outline-none transition"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight mb-10">CHECKOUT</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-2">DATE DE LIVRARE</h2>
            {field("name", "Nume complet")}
            {field("email", "Email", "email")}
            {field("phone", "Telefon", "tel")}
            {field("address", "Adresă")}
            <div className="grid grid-cols-2 gap-4">
              {field("city", "Oraș")}
              {field("postalCode", "Cod poștal")}
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wide mb-1">Note (opțional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 focus:outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Right */}
          <div>
            <h2 className="font-bold text-lg mb-4">SUMAR COMANDĂ</h2>
            <div className="bg-zinc-900 rounded-2xl p-4 space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-white/40">
                      {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCode ? (
                <div className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-400" />
                    <span className="text-green-400 font-mono font-bold text-sm">{appliedCode}</span>
                    <span className="text-green-400 text-sm">— {formatPrice(discount)} reducere</span>
                  </div>
                  <button onClick={removeCoupon} type="button" className="text-green-400/60 hover:text-green-400">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cod de reducere..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono uppercase focus:border-violet-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition"
                  >
                    {couponLoading ? "..." : "Aplică"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 space-y-2 text-sm mb-6">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Livrare</span><span>{formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Reducere</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span className="text-violet-500">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl text-sm tracking-wide transition"
            >
              {loading ? "Se procesează..." : `PLĂTEȘTE ${formatPrice(orderTotal)}`}
            </button>
            <p className="text-center text-white/30 text-xs mt-3">Plată securizată prin Stripe</p>
          </div>
        </div>
      </form>
    </div>
  );
}
