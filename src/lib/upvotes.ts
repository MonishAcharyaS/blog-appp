// Deterministic seed / persistent helper for Upvotes count
export function getPostUpvotesCount(postId: string): number {
  if (!postId) return 0;
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash << 7) - hash + postId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 25) + 5;
}
