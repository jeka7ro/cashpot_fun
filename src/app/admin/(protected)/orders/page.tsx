import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import UpdateOrderStatus from "@/components/admin/UpdateOrderStatus";
import OrderTrackingForm from "@/components/admin/OrderTrackingForm";
import Link from "next/link";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
const PER_PAGE = 20;

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { status, q, page } = params;
  const pageNum = parseInt(page || "1");

  const where = {
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { orderNumber: { contains: q } },
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ],
    } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (pageNum - 1) * PER_PAGE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Revenue for filtered set
  const revenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { ...where, status: { in: ["paid", "shipped", "delivered"] } },
  });

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q, page, ...newParams };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/orders?${p.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">COMENZI</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm mt-1">
            {total} comenzi · {formatPrice(revenue._sum.total || 0)} venituri
          </p>
        </div>
        <a
          href="/api/orders/export"
          className="flex items-center gap-2 border border-gray-300 hover:border-violet-500 dark:border-white/20 dark:hover:border-white/40 text-gray-700 hover:text-violet-600 dark:text-white dark:hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition bg-white dark:bg-transparent shadow-sm dark:shadow-none"
        >
          <Download size={16} /> Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
        <form method="GET" action="/admin/orders" className="flex gap-2 flex-1 min-w-48">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Caută după număr, client, email..."
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="bg-violet-500 hover:bg-violet-400 text-white dark:text-black font-bold px-4 py-2 rounded-xl text-sm transition">
            Caută
          </button>
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={buildUrl({ status: undefined, page: "1" })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${!status ? "bg-violet-500 text-white dark:text-black" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Toate ({total})
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s, page: "1" })}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${status === s ? "bg-violet-500 text-white dark:text-black" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"}`}
            >
              {s.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => (
          <details key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none group">
            <summary className="flex flex-wrap items-center gap-4 p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-white/2 rounded-2xl transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-violet-600 dark:text-violet-500 text-sm font-bold">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.status} />
                  {order.trackingNumber && (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400 px-2 py-0.5 rounded font-mono">
                      {order.trackingNumber}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{order.name} · {order.email}</p>
                <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">
                  {new Date(order.createdAt).toLocaleString("ro-RO")} · {order.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                <p className="text-gray-500 dark:text-white/40 text-xs">{order.items.length} produse</p>
              </div>
            </summary>

            <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: order details */}
                <div>
                  <h4 className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-3">Produse comandate</h4>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-white/40">
                            {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/10 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-white/50">
                      <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-white/50">
                      <span>Livrare</span><span>{formatPrice(order.shipping)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Reducere {order.couponCode && `(${order.couponCode})`}</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-1 border-t border-gray-100 dark:border-white/10 text-gray-900 dark:text-white">
                      <span>TOTAL</span><span className="text-violet-600 dark:text-violet-500">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: shipping + actions */}
                <div>
                  <h4 className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-3">Adresă livrare</h4>
                  <div className="text-sm text-gray-700 dark:text-white/70 space-y-0.5 mb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{order.name}</p>
                    <p>{order.address}</p>
                    <p>{order.city}, {order.postalCode}</p>
                    <p>{order.country}</p>
                    {order.phone && <p>{order.phone}</p>}
                    <a href={`mailto:${order.email}`} className="text-violet-600 dark:text-violet-500 hover:underline">{order.email}</a>
                  </div>
                  {order.notes && (
                    <div className="bg-yellow-50 dark:bg-zinc-800 rounded-xl p-3 mb-4 border border-yellow-200 dark:border-transparent">
                      <p className="text-yellow-800 dark:text-white/40 text-xs mb-1 font-semibold dark:font-normal">Note client:</p>
                      <p className="text-sm italic text-yellow-900 dark:text-white">{order.notes}</p>
                    </div>
                  )}
                  <h4 className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-2">Status comandă</h4>
                  <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                  <div className="mt-3">
                    <OrderTrackingForm orderId={order.id} currentTracking={order.trackingNumber || ""} />
                  </div>
                </div>
              </div>
            </div>
          </details>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-white/30 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-transparent">
            Nicio comandă găsită.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition ${
                p === pageNum ? "bg-violet-500 text-white dark:text-black" : "bg-white dark:bg-zinc-900 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
