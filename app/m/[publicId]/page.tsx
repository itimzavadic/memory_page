import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MemorialPageView } from "@/components/memorial/MemorialPageView";
import { getMemorialByPublicId } from "@/services/memorial.service";
import { fileUrl, getSiteUrl } from "@/lib/utils";
import { sanitizePlainText } from "@/lib/sanitize";
import { getSiteSettings } from "@/services/site.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const memorial = await getMemorialByPublicId(publicId);
  if (!memorial) {
    return { title: "Страница не найдена" };
  }

  const description =
    memorial.epitaph ??
    `Памятная страница ${memorial.fullName}. ${memorial.birthDate} — ${memorial.deathDate}.`;

  const cover = fileUrl(memorial.coverPhoto);

  return {
    title: memorial.fullName,
    description: sanitizePlainText(description),
    openGraph: {
      title: memorial.fullName,
      description: sanitizePlainText(description),
      type: "website",
      url: `${getSiteUrl()}/m/${publicId}`,
      images: cover ? [{ url: `${getSiteUrl()}${cover}` }] : undefined,
    },
  };
}

export default async function PublicIdMemorialPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const memorial = await getMemorialByPublicId(publicId);
  if (!memorial) notFound();

  const siteSettings = await getSiteSettings();

  return <MemorialPageView memorial={memorial} siteSettings={siteSettings} />;
}
