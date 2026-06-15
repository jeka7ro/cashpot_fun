import { prisma } from "./prisma";

export type SiteSettings = Record<string, string>;

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function getSetting(settings: SiteSettings, key: string, fallback = "") {
  return settings[key] ?? fallback;
}
