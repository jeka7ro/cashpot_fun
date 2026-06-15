"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OrderTrackingForm({
  orderId,
  currentTracking,
}: {
  orderId: string;
  currentTracking: string;
}) {
  const [tracking, setTracking] = useState(currentTracking);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const save = async () => {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Tracking salvat");
      router.refresh();
    } else {
      toast.error("Eroare");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Nr. tracking AWB..."
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <button
        onClick={save}
        disabled={loading}
        className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
      >
        {loading ? "..." : "Salvează"}
      </button>
    </div>
  );
}
