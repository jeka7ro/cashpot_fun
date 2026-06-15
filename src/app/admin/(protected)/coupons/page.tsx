import { prisma } from "@/lib/prisma";
import CouponsManager from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.couponCode.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">CODURI REDUCERE</h1>
        <p className="text-gray-500 dark:text-white/40 text-sm mt-1">Creează și gestionează coduri promo</p>
      </div>
      <CouponsManager coupons={coupons} />
    </div>
  );
}
