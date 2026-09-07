/**
 * Utility to calculate dynamic reading time from text/HTML content.
 * Standard average adult reading speed: 200 words per minute (WPM).
 */
export function calculateReadingTime(content: string, wpm = 200): string {
  if (!content || typeof content !== "string") {
    return "1 min read";
  }

  // Strip HTML tags
  const cleanText = content.replace(/<[^>]*>/g, " ");

  // Count words matching non-whitespace sequences
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return "1 min read";
  }

  const minutes = Math.ceil(wordCount / wpm);
  return `${minutes} min read`;
}
