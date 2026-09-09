"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";

interface BookmarkedPost extends BlogPost {
  bookmarkedAt?: string | Date;
}

interface BookmarksFeedProps {
  initialBookmarks: BookmarkedPost[];
}

export const BookmarksFeed: React.FC<BookmarksFeedProps> = ({ initialBookmarks }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "likes" | "views">("recent");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRemoveBookmark = async (postId: string) => {
    setRemovingId(postId);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to remove bookmark");
      }

      startTransition(() => {
        setBookmarks((prev) => prev.filter((p) => p.id !== postId));
      });
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    } finally {
      setRemovingId(null);
    }
  };

  // Filter & Sort
  const filteredBookmarks = bookmarks.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(query);
    const excerptMatch = post.excerpt?.toLowerCase().includes(query);
    const authorMatch = post.author?.name?.toLowerCase().includes(query);
    const categoryMatch = post.category?.name?.toLowerCase().includes(query);
    return titleMatch || excerptMatch || authorMatch || categoryMatch;
  });

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    if (sortBy === "likes") {
      return (b._count?.likes ?? 0) - (a._count?.likes ?? 0);
    }
    if (sortBy === "views") {
      return (b.views ?? 0) - (a.views ?? 0);
    }
    // Default 'recent': Sort by bookmarkedAt or createdAt descending
    const dateA = new Date(a.bookmarkedAt || a.createdAt).getTime();
    const dateB = new Date(b.bookmarkedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Sort (only if user has bookmarks) */}
      {bookmarks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="bookmarks-search-input"
              data-testid="bookmarks-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved articles..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Sort by:
            </span>
            <select
              id="bookmarks-sort-select"
              data-testid="bookmarks-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] font-medium"
            >
              <option value="recent">Recently Saved</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      )}

      {/* Bookmarks Grid / Empty State */}
      {sortedBookmarks.length > 0 ? (
        <div
          id="bookmarks-posts-grid"
          data-testid="bookmarks-posts-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedBookmarks.map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const likesCount = post._count?.likes ?? 0;
            const isRemoving = removingId === post.id;

            return (
              <article
                key={post.id}
                id={`bookmark-card-${post.id}`}
                data-testid="bookmark-card"
                className={`group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  isRemoving ? "opacity-50 pointer-events-none scale-95" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <Link href={`/posts/${post.slug}`} className="block w-full h-full">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 text-indigo-600 dark:text-indigo-400 font-bold">
                        Blogify
                      </div>
                    )}
                  </Link>

                  {/* Remove Bookmark Quick Action */}
                  <button
                    type="button"
                    title="Remove from bookmarks"
                    aria-label="Remove bookmark"
                    data-testid="remove-bookmark-btn"
                    onClick={() => handleRemoveBookmark(post.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all shadow-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    {post.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">General</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{post.readingTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#5B48EE] dark:group-hover:text-[#818CF8] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {post.author?.name || "Author"}
                    </span>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{likesCount}</span>
                      </span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          id="bookmarks-empty-state"
          data-testid="bookmarks-empty-state"
          className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-4 max-w-xl mx-auto shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#5B48EE]/10 dark:bg-[#5B48EE]/20 text-[#5B48EE] flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h3
              id="empty-state-title"
              data-testid="empty-state-title"
              className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
            >
              {searchQuery ? "No matching bookmarks found" : "Your reading list is empty"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {searchQuery
                ? "Try searching for a different keyword or topic."
                : "Bookmark articles as you explore the platform to build your personalized reading collection."}
            </p>
          </div>

          {!searchQuery && (
            <Link
              id="explore-articles-btn"
              data-testid="explore-articles-btn"
              href="/explore"
              className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Explore Articles</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
