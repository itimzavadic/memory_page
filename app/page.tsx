import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-memorial-bg">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <p className="memorial-heading text-3xl text-memorial-text md:text-5xl">
          mp_vobraz
        </p>
        <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide text-memorial-text md:text-3xl">
          Памятные страницы для близких
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-memorial-text/90">
          Создавайте достойные страницы памяти с фотографиями, биографией и видео.
          Для каждой страницы генерируется QR-код для установки на памятник.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/admin/login"
            className="rounded border border-memorial-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-memorial-accent hover:bg-teal-50"
          >
            Войти в админку
          </Link>
        </div>
      </section>

      <section className="border-t border-memorial-border bg-white/60 px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <Feature
            title="Постоянная ссылка"
            text="QR-код ведёт на неизменяемый адрес, даже если slug страницы изменится."
          />
          <Feature
            title="QR для гравировки"
            text="Скачивайте PNG для предпросмотра и SVG для передачи подрядчику."
          />
          <Feature
            title="Управление контентом"
            text="Фото, биография, видео и место захоронения в одной админ-панели."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-memorial-border bg-white p-6 shadow-[0_1px_3px_rgb(236,236,236)]">
      <h2 className="text-sm font-bold uppercase tracking-wide text-memorial-text">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-memorial-text/90">{text}</p>
    </div>
  );
}
