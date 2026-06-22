"use client";

import { useState } from "react";
import { getQrTargetUrl } from "@/lib/utils";

interface ShareButtonProps {
  publicId: string | null;
  fullName: string;
}

export function ShareButton({ publicId, fullName }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    if (!publicId) {
      setMessage("Ссылка появится после публикации");
      return;
    }

    const url = getQrTargetUrl(publicId);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Память — ${fullName}`,
          url,
        });
        return;
      } catch {
        // fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setMessage("Ссылка скопирована");
      setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage(url);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="rounded border border-memorial-accent bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-memorial-accent hover:bg-teal-50"
      >
        Поделиться
      </button>
      {message && <p className="text-xs text-memorial-text/70">{message}</p>}
    </div>
  );
}
