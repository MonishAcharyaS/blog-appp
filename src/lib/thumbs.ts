// Deterministic seed / persistent helper for Thumbs Up count
export function getPostThumbsCount(postId: string): number {
  if (!postId) return 0;
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash << 5) - hash + postId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 15) + 3;
}
