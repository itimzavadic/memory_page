const DEFAULT_ASPECT = 16 / 9;

export async function detectVideoAspectRatio(url: string): Promise<number> {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
      return DEFAULT_ASPECT;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (!videoId) return DEFAULT_ASPECT;
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      );
      if (response.ok) {
        const data = (await response.json()) as { width?: number; height?: number };
        if (data.width && data.height) return data.width / data.height;
      }
    }
  } catch {
    return DEFAULT_ASPECT;
  }

  return DEFAULT_ASPECT;
}
