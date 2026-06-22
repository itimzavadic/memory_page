import type { SiteSettingsData } from "@/types/memorial";
import { ShareButton } from "@/components/memorial/ShareButton";

interface MemorialFooterProps {
  siteSettings: SiteSettingsData;
  publicId: string | null;
  fullName: string;
}

export function MemorialFooter({ siteSettings, publicId, fullName }: MemorialFooterProps) {
  return (
    <footer className="border-t border-memorial-border/40 px-6 py-12 text-center">
      <ShareButton publicId={publicId} fullName={fullName} />

      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <p className="text-sm leading-6 text-memorial-text/80">{siteSettings.companyText}</p>

        {siteSettings.partners.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {siteSettings.partners.map((partner) =>
              partner.url ? (
                <a
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs uppercase tracking-widest text-memorial-text/60 hover:text-memorial-accent"
                >
                  {partner.name}
                </a>
              ) : (
                <span
                  key={partner.name}
                  className="text-xs uppercase tracking-widest text-memorial-text/60"
                >
                  {partner.name}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-xs uppercase tracking-widest text-memorial-text/50">mp_vobraz</p>
    </footer>
  );
}
