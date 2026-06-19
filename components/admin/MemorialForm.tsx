"use client";

import { useState, useTransition } from "react";
import slugify from "slugify";

export interface MemorialFormValues {
  fullName: string;
  slug: string;
  birthDate: string;
  deathDate: string;
  epitaph: string;
  biography: string;
  cemeteryLocation: string;
  videoUrls: string;
}

interface MemorialFormProps {
  initialValues?: Partial<MemorialFormValues>;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
}

const defaultValues: MemorialFormValues = {
  fullName: "",
  slug: "",
  birthDate: "",
  deathDate: "",
  epitaph: "",
  biography: "",
  cemeteryLocation: "",
  videoUrls: "",
};

export function MemorialForm({
  initialValues,
  submitLabel,
  action,
}: MemorialFormProps) {
  const [values, setValues] = useState<MemorialFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof MemorialFormValues>(
    key: K,
    value: MemorialFormValues[K],
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "fullName" && !slugTouched) {
        next.slug = slugify(value, { lower: true, strict: true, locale: "ru" });
      }
      return next;
    });
  }

  function buildFormData(): FormData {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("slug", values.slug);
    formData.set("birthDate", values.birthDate);
    formData.set("deathDate", values.deathDate);
    formData.set("epitaph", values.epitaph);
    formData.set("biography", values.biography);
    formData.set("cemeteryLocation", values.cemeteryLocation);
    formData.set("videoUrls", values.videoUrls);
    return formData;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!values.fullName.trim()) {
      setError("Укажите ФИО");
      return;
    }
    if (!values.slug.trim()) {
      setError("Укажите slug или заполните ФИО для автогенерации");
      return;
    }
    if (!values.birthDate || !values.deathDate) {
      setError("Укажите даты рождения и смерти");
      return;
    }

    startTransition(() => {
      void action(buildFormData());
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-5 p-6">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="ФИО *">
          <input
            name="fullName"
            required
            value={values.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2"
          />
        </Field>
        <Field label="Slug (URL) *">
          <input
            name="slug"
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", e.target.value);
            }}
            className="w-full rounded border border-stone-300 px-3 py-2"
          />
        </Field>
        <Field label="Дата рождения *">
          <input
            name="birthDate"
            type="date"
            required
            value={values.birthDate}
            onChange={(e) => updateField("birthDate", e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2"
          />
        </Field>
        <Field label="Дата смерти *">
          <input
            name="deathDate"
            type="date"
            required
            value={values.deathDate}
            onChange={(e) => updateField("deathDate", e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2"
          />
        </Field>
      </div>

      <Field label="Эпитафий">
        <textarea
          name="epitaph"
          rows={3}
          value={values.epitaph}
          onChange={(e) => updateField("epitaph", e.target.value)}
          className="w-full rounded border border-stone-300 px-3 py-2"
        />
      </Field>

      <Field label="Биография (HTML: p, strong, em, ul, ol, li)">
        <textarea
          name="biography"
          rows={8}
          value={values.biography}
          onChange={(e) => updateField("biography", e.target.value)}
          className="w-full rounded border border-stone-300 px-3 py-2 font-mono text-sm"
        />
      </Field>

      <Field label="Место захоронения">
        <input
          name="cemeteryLocation"
          value={values.cemeteryLocation}
          onChange={(e) => updateField("cemeteryLocation", e.target.value)}
          className="w-full rounded border border-stone-300 px-3 py-2"
        />
      </Field>

      <Field label="Ссылки на видео (по одной на строку)">
        <textarea
          name="videoUrls"
          rows={3}
          value={values.videoUrls}
          onChange={(e) => updateField("videoUrls", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded border border-stone-300 px-3 py-2"
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-memorial-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-stone-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
