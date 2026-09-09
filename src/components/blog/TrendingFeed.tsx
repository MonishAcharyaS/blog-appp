"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export type TrendingMetric = "all" | "likes" | "views" | "comments";

interface TrendingFeedProps {
  initialPosts: BlogPost[];
}

export const TrendingFeed: React.FC<TrendingFeedProps> = ({ initialPosts }) => {
  const [metric, setMetric] = useState<TrendingMetric>("all");

  const sortedPosts = [...initialPosts].sort((a, b) => {
    const aLikes = a._count?.likes ?? 0;
    const bLikes = b._count?.likes ?? 0;
    const aComments = a._count?.comments ?? 0;
    const bComments = b._count?.comments ?? 0;
    const aViews = a.views ?? 0;
    const bViews = b.views ?? 0;

    if (metric === "likes") return bLikes - aLikes;
    if (metric === "views") return bViews - aViews;
    if (metric === "comments") return bComments - aComments;

    // "all" compound score: views * 1 + likes * 10 + comments * 15
    const aScore = aViews + aLikes * 10 + aComments * 15;
    const bScore = bViews + bLikes * 10 + bComments * 15;
    return bScore - aScore;
  });

  return (
    <div id="trending-feed-container" className="space-y-8">
      {/* Metric Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-gray-800/80 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl w-fit">
          <button
            type="button"
            id="trending-tab-all"
            onClick={() => setMetric("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              metric === "all"
                ? "bg-white dark:bg-gray-900 text-[#5B48EE] dark:text-[#818CF8] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
            }`}
          >
            🔥 Overall Trending
          </button>
          <button
            type="button"
            id="trending-tab-likes"
            onClick={() => setMetric("likes")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              metric === "likes"
                ? "bg-white dark:bg-gray-900 text-[#5B48EE] dark:text-[#818CF8] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
            }`}
          >
            ❤️ Most Liked
          </button>
          <button
            type="button"
            id="trending-tab-views"
            onClick={() => setMetric("views")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              metric === "views"
                ? "bg-white dark:bg-gray-900 text-[#5B48EE] dark:text-[#818CF8] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
            }`}
          >
            👁️ Most Viewed
          </button>
          <button
            type="button"
            id="trending-tab-comments"
            onClick={() => setMetric("comments")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              metric === "comments"
                ? "bg-white dark:bg-gray-900 text-[#5B48EE] dark:text-[#818CF8] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
            }`}
          >
            💬 Most Discussed
          </button>
        </div>

        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Showing top {sortedPosts.length} ranked stories
        </span>
      </div>

      {/* Top 1 Hero Leaderboard Card */}
      {sortedPosts.length > 0 && (
        <div
          id="trending-top-story"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-amber-500/20 dark:border-amber-500/30 p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <span>🏆 #1 Trending Across Platform</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                <Link
                  id="trending-hero-title-link"
                  href={`/posts/${sortedPosts[0].slug}`}
                  className="hover:text-[#5B48EE] transition-colors"
                >
                  {sortedPosts[0].title}
                </Link>
              </h2>
              {sortedPosts[0].excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {sortedPosts[0].excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300 pt-1">
                <span>By {sortedPosts[0].author?.name ?? "Anonymous"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  ❤️ {sortedPosts[0]._count?.likes ?? 0} likes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  👁️ {sortedPosts[0].views ?? 0} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  💬 {sortedPosts[0]._count?.comments ?? 0} comments
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                id="trending-hero-read-btn"
                href={`/posts/${sortedPosts[0].slug}`}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Read Top Story →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Trending Stories */}
      {sortedPosts.length === 0 ? (
        <div
          id="trending-empty-state"
          className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No trending articles found at the moment.
          </p>
        </div>
      ) : (
        <div
          id="trending-articles-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedPosts.map((post, index) => (
            <div key={post.id} className="relative group">
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-xl bg-gray-950/80 text-white text-xs font-black backdrop-blur-md shadow-lg border border-white/20">
                #{index + 1}
              </div>
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
