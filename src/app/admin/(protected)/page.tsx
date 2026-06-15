import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, Clock, ArrowUpRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-500",
  paid:      "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400",
  shipped:   "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400",
};

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    productCount,
    totalOrders,
    recentOrders,
    revenue,
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    pendingOrders,
    uniqueCustomers,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: { take: 1 } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["paid", "shipped", "delivered"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["paid", "shipped", "delivered"] },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["paid", "shipped", "delivered"] },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.groupBy({ by: ["email"], _count: true }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const thisMonthRevenue = revenueThisMonth._sum.total || 0;
  const lastMonthRevenue = revenueLastMonth._sum.total || 0;
  const revenueGrowth = lastMonthRevenue
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const stats = [
    {
      label: "Venituri totale",
      value: formatPrice(revenue._sum.total || 0),
      sub: `${formatPrice(thisMonthRevenue)} luna aceasta`,
      growth: revenueGrowth,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Total comenzi",
      value: totalOrders,
      sub: `${ordersThisMonth} luna aceasta`,
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Produse active",
      value: productCount,
      sub: "în catalog",
      icon: Package,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Comenzi în așteptare",
      value: pendingOrders,
      sub: `${uniqueCustomers.length} clienți unici`,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">DASHBOARD</h1>
        <p className="text-gray-500 dark:text-white/40 text-sm">
          {now.toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={s.color} size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">{s.label}</p>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-gray-400 dark:text-white/30 text-xs">{s.sub}</p>
              {"growth" in s && s.growth != null && s.growth !== 0 && (
                <span className={`text-xs font-semibold ml-1 ${(s.growth as number) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {(s.growth as number) > 0 ? "+" : ""}{(s.growth as number).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
            <h2 className="font-bold text-gray-900 dark:text-white">COMENZI RECENTE</h2>
            <Link href="/admin/orders" className="text-violet-600 dark:text-violet-500 text-xs hover:underline flex items-center gap-1">
              Toate comenzile <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 dark:text-white/30 text-xs border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-5 py-3 font-semibold">Număr</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell font-semibold">Client</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition text-gray-700 dark:text-white">
                    <td className="px-5 py-3">
                      <p className="font-mono text-violet-600 dark:text-violet-500 text-xs">{order.orderNumber}</p>
                      <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("ro-RO")}
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{order.name}</p>
                      <p className="text-gray-500 dark:text-white/40 text-xs">{order.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white"}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 dark:text-white/30">Nicio comandă.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
            <h2 className="font-bold text-gray-900 dark:text-white">TOP PRODUSE</h2>
            <Link href="/admin/products" className="text-violet-600 dark:text-violet-500 text-xs hover:underline flex items-center gap-1">
              Produse <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="text-gray-400 dark:text-white/20 text-xs font-mono w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-gray-500 dark:text-white/40 text-xs">{p._sum.quantity || 0} bucăți vândute</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-gray-400 dark:text-white/30 text-sm py-8">Nicio vânzare încă.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/products/new", label: "Produs nou", icon: Package },
          { href: "/admin/orders", label: "Comenzi noi", icon: ShoppingBag, badge: pendingOrders },
          { href: "/admin/cms", label: "Editează CMS", icon: TrendingUp },
          { href: "/admin/coupons", label: "Cod reducere", icon: TrendingUp },
        ].map(({ href, label, icon: Icon, badge }) => (
          <Link key={href} href={href}
            className="bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-3 transition group shadow-sm dark:shadow-none">
            <Icon size={18} className="text-gray-400 group-hover:text-violet-600 dark:text-white/40 dark:group-hover:text-violet-500 transition" />
            <span className="text-sm font-medium text-gray-800 dark:text-white">{label}</span>
            {badge ? (
              <span className="ml-auto bg-violet-100 text-violet-700 dark:bg-violet-500 dark:text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
