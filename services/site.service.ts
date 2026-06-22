import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { SitePartner, SiteSettingsData } from "@/types/memorial";

function parsePartners(raw: string | null | undefined): SitePartner[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SitePartner =>
        !!item && typeof item === "object" && typeof item.name === "string",
    );
  } catch {
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const [row] = await db.select().from(siteSettings).limit(1);

  if (!row) {
    return {
      companyText: "mp_vobraz — страницы светлой памяти",
      partners: [],
    };
  }

  return {
    companyText: row.companyText ?? "mp_vobraz",
    partners: parsePartners(row.partnersJson),
  };
}
