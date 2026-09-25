// Persistent in-memory cache layered on deterministic seed for Thumbs Up count
const globalForThumbs = globalThis as unknown as {
  postThumbsCounts?: Record<string, number>;
};

if (!globalForThumbs.postThumbsCounts) {
  globalForThumbs.postThumbsCounts = {};
}

export function getPostThumbsCount(postId: string): number {
  if (!postId) return 0;
  if (typeof globalForThumbs.postThumbsCounts?.[postId] === "number") {
    return globalForThumbs.postThumbsCounts[postId];
  }
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash << 5) - hash + postId.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash % 15) + 3;
  if (globalForThumbs.postThumbsCounts) {
    globalForThumbs.postThumbsCounts[postId] = base;
  }
  return base;
}

export function adjustPostThumbsCount(postId: string, delta: number): number {
  const current = getPostThumbsCount(postId);
  const updated = Math.max(0, current + delta);
  if (globalForThumbs.postThumbsCounts) {
    globalForThumbs.postThumbsCounts[postId] = updated;
  }
  return updated;
}

