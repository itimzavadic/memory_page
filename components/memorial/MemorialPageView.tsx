import Image from "next/image";
import type { MemorialPublicData } from "@/types/memorial";
import { fileUrl, formatDateRu, getMemorialFramePhotoSize, getVideoEmbedUrl } from "@/lib/utils";

interface MemorialPageViewProps {
  memorial: MemorialPublicData;
}

const FRAME_IMAGE = "/assets/frame.png";
const CANDLE_MOVE_DISTANCE_PX = 380;
const CANDLE_MOVE_ANGLE_DEG = 65;
const CANDLE_HEIGHT_PX = 350;
const CANDLE_OFFSET_X_EXTRA_PX = 5;
const CANDLE_OFFSET_Y_EXTRA_PX = -5;

function getCandleTransform(): string {
  const radians = (CANDLE_MOVE_ANGLE_DEG * Math.PI) / 180;
  const offsetX = CANDLE_MOVE_DISTANCE_PX * Math.cos(radians) + CANDLE_OFFSET_X_EXTRA_PX;
  const offsetY = -CANDLE_MOVE_DISTANCE_PX * Math.sin(radians) + CANDLE_OFFSET_Y_EXTRA_PX;
  return `translate(calc(-28% + ${offsetX}px), calc(10% + ${offsetY}px))`;
}

function splitFullName(fullName: string): string[] {
  return fullName.trim().split(/\s+/).filter(Boolean);
}

export function MemorialPageView({ memorial }: MemorialPageViewProps) {
  const framePhoto = fileUrl(memorial.coverPhoto);
  const framePhotoSize = getMemorialFramePhotoSize();
  const nameParts = splitFullName(memorial.fullName);
  const birthFormatted = formatDateRu(memorial.birthDate);
  const deathFormatted = formatDateRu(memorial.deathDate);

  return (
    <main className="bg-memorial-bg-lower text-memorial-text">
      <section className="memorial-hero flex min-h-screen flex-col overflow-hidden bg-memorial-bg">
        <div className="memorial-hero-content flex min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          {/* Левая половина: рамка (размер и положение зафиксированы в globals.css) */}
          <div className="relative flex items-end justify-start py-[var(--memorial-hero-padding-y)] pl-[var(--memorial-hero-padding-x)] pr-[var(--memorial-space-sm)] lg:pr-[var(--memorial-space-md)]">
            <div className="memorial-frame-composition relative w-full max-w-md lg:max-w-none">
              <div
                className="pointer-events-none absolute bottom-0 left-0 z-20"
                style={{ transform: getCandleTransform() }}
              >
                <Image
                  src="/assets/candle.png"
                  alt=""
                  width={1500}
                  height={1280}
                  unoptimized
                  className="h-[350px] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
                  aria-hidden
                />
              </div>
              <div className="memorial-frame-fixed relative z-10">
                <Image
                  src={FRAME_IMAGE}
                  alt=""
                  fill
                  className="pointer-events-none relative z-0 object-contain"
                  aria-hidden
                  priority
                />
                <div className="absolute inset-[9%] z-20 flex items-center justify-center">
                  <div
                    className="relative max-h-full max-w-full"
                    style={{
                      width: framePhotoSize.width,
                      height: framePhotoSize.height,
                    }}
                  >
                    {framePhoto ? (
                      <Image
                        src={framePhoto}
                        alt={memorial.fullName}
                        fill
                        className="object-cover"
                        sizes={`${framePhotoSize.width}px`}
                        priority
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая половина: текст по центру (на lg — поверх hero, не влияет на высоту grid) */}
          <div className="flex min-h-[70vh] w-full -translate-y-[140px] flex-col items-center justify-center px-[var(--memorial-hero-padding-x)] py-[var(--memorial-hero-padding-y)] text-center lg:absolute lg:inset-y-0 lg:right-0 lg:min-h-0 lg:w-1/2">
            <p className="memorial-script text-3xl leading-none text-memorial-text sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
              С любовью светлая память
            </p>

            <div className="memorial-name mt-[var(--memorial-space-sm)] space-y-[var(--memorial-space-xs)] text-3xl leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              {nameParts.map((part, index) => (
                <span key={`${part}-${index}`} className="block">
                  {part}
                </span>
              ))}
            </div>

            <div className="mt-[var(--memorial-space-sm)] text-base text-memorial-text/90 sm:text-lg lg:text-xl">
              <p>
                {birthFormatted} - {deathFormatted}
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <div className="pt-[var(--memorial-lower-content-offset)]">
      {memorial.epitaph && (
        <section className="mx-auto max-w-2xl px-6 py-10 text-center">
          <p className="memorial-heading text-xl italic md:text-2xl">{memorial.epitaph}</p>
        </section>
      )}

      {memorial.biography && (
        <section className="mx-auto max-w-2xl px-6 py-10">
          <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-wide">
            Биография
          </h2>
          <div
            className="space-y-4 text-base leading-7"
            dangerouslySetInnerHTML={{ __html: memorial.biography }}
          />
        </section>
      )}

      {memorial.videoUrls.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-wide">
            Видео
          </h2>
          <div className="space-y-6">
            {memorial.videoUrls.map((url) => {
              const embed = getVideoEmbedUrl(url);
              if (embed) {
                return (
                  <div
                    key={url}
                    className="aspect-video overflow-hidden rounded-md border border-memorial-border bg-black"
                  >
                    <iframe
                      src={embed}
                      title={`Видео — ${memorial.fullName}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <a
                  key={url}
                  href={url}
                  className="block text-memorial-accent underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {url}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {memorial.cemeteryLocation && (
        <section className="mx-auto max-w-2xl px-6 py-10 text-center">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
            Место захоронения
          </h2>
          <p className="text-base">{memorial.cemeteryLocation}</p>
        </section>
      )}

      <footer className="px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-memorial-text/70">mp_vobraz</p>
      </footer>
      </div>
    </main>
  );
}
