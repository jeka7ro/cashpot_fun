"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Ești sigur că vrei să ștergi "${name}"?`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Produs șters");
      router.refresh();
    } else {
      toast.error("Eroare la ștergere");
    }
  };

  return (
    <button onClick={handleDelete} className="p-2 text-white/40 hover:text-red-400 transition">
      <Trash2 size={16} />
    </button>
  );
}
