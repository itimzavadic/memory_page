import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MemorialPageView } from "@/components/memorial/MemorialPageView";
import { getMemorialBySlug } from "@/services/memorial.service";
import { fileUrl, getSiteUrl } from "@/lib/utils";
import { sanitizePlainText } from "@/lib/sanitize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const memorial = await getMemorialBySlug(slug);
  if (!memorial) {
    return { title: "Страница не найдена" };
  }

  const description =
    memorial.epitaph ??
    `Памятная страница ${memorial.fullName}. ${memorial.birthDate} — ${memorial.deathDate}.`;

  const cover = fileUrl(memorial.coverPhoto);
  const canonical = `${getSiteUrl()}/memorial/${slug}`;

  return {
    title: memorial.fullName,
    description: sanitizePlainText(description),
    alternates: { canonical },
    openGraph: {
      title: memorial.fullName,
      description: sanitizePlainText(description),
      type: "website",
      url: canonical,
      images: cover ? [{ url: `${getSiteUrl()}${cover}` }] : undefined,
    },
  };
}

export default async function SlugMemorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const memorial = await getMemorialBySlug(slug);
  if (!memorial) notFound();

  return <MemorialPageView memorial={memorial} />;
}
