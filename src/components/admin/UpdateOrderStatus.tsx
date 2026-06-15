"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const update = async (status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status actualizat");
      router.refresh();
    } else {
      toast.error("Eroare");
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => update(s)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
            currentStatus === s
              ? "border-violet-500 text-violet-600 dark:text-violet-500"
              : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 dark:border-white/20 dark:text-white/40 dark:hover:border-white/50 dark:hover:text-white"
          }`}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
