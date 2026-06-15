const STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "În așteptare", cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-500" },
  paid:      { label: "Plătit",       cls: "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400" },
  shipped:   { label: "Expediat",     cls: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400" },
  delivered: { label: "Livrat",       cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" },
  cancelled: { label: "Anulat",       cls: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, cls: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white" };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
