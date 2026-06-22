import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
];

/** Без sanitize-html — не тянет dom-serializer в SSR-бандл публичных страниц. */
export function sanitizePlainText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}
