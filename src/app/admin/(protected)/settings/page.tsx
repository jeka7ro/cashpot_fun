import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  const admin = await prisma.admin.findUnique({ where: { email: session!.user!.email! } });

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">SETĂRI CONT</h1>
      <AdminSettingsForm adminName={admin?.name || ""} adminEmail={admin?.email || ""} />
    </div>
  );
}
