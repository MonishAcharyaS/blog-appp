import DOMPurify from "dompurify";

/**
 * Sanitizes HTML strings using DOMPurify with strict allowed tags and attributes
 * to prevent XSS while preserving rich article typography.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";

  // If running in browser or SSR with window available
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "span",
        "strong",
        "em",
        "b",
        "i",
        "u",
        "s",
        "strike",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "hr",
        "br",
        "img",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "alt",
        "title",
        "width",
        "height",
        "class",
      ],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ["target"],
      FORBID_TAGS: ["script", "iframe", "object", "embed", "style", "form", "input"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    });
  }

  // Fallback if rendered on server without JSDOM: simple safe regex cleanup
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "");
}
