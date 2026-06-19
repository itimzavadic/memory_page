import type { MetadataRoute } from "next";
import { getPublishedMemorialSlugs } from "@/services/memorial.service";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const memorials = await getPublishedMemorialSlugs();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...memorials.map((item) => ({
      url: `${siteUrl}/memorial/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
