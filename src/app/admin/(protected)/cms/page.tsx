import { getSettings } from "@/lib/settings";
import CmsForm from "@/components/admin/CmsForm";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  const settings = await getSettings();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">CMS — CONȚINUT SITE</h1>
        <p className="text-gray-500 dark:text-white/40 text-sm mt-1">Editează textele, culorile și setările vizuale ale site-ului</p>
      </div>
      <CmsForm settings={settings} />
    </div>
  );
}
