"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { TiltCard } from "@/components/3d/TiltCard";
import { ShareModal } from "@/components/article/ShareModal";
import { LikeButton } from "@/components/article/LikeButton";

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const likesCount = post._count?.likes ?? 0;
  const commentsCount = post._count?.comments ?? 0;

  return (
    <>
      <TiltCard maxTilt={7} glareOpacity={0.18} className="h-full">
        <article
          data-testid="blog-card"
          data-post-slug={post.slug}
          data-likes={likesCount}
          data-views={post.views}
          className="group flex flex-col h-full spatial-glass rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 preserve-3d p-5 sm:p-6 space-y-4"
        >
          {/* 1. Author Attribution Header (Top) */}
          <div
            data-testid="post-card-author-header"
            className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center text-xs font-bold text-[#5B48EE] dark:text-[#818CF8] ring-1 ring-black/5 dark:ring-white/10">
                {post.author.image ? (
                  <img
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  post.author.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-gray-900 dark:text-white truncate">
                  {post.author.name || "Anonymous Author"}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {post.category ? (
                <span
                  data-category-slug={post.category.slug}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 tech-chip"
                >
                  {post.category.name}
                </span>
              ) : (
                <span className="text-xs text-gray-400 tech-chip">General</span>
              )}
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                {post.readingTime}
              </span>
            </div>
          </div>

          {/* 2. Heading & Subheading */}
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#5B48EE] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
              <Link
                href={`/posts/${post.slug}`}
                data-testid="post-card-title"
                className="hover:underline"
              >
                {post.title}
              </Link>
            </h2>
            {post.category && (
              <p
                data-testid="post-card-subheading"
                className="text-xs font-medium text-indigo-600/90 dark:text-indigo-400/90 tracking-wide uppercase font-mono"
              >
                // {post.category.name} • Engineering Brief
              </p>
            )}
          </div>

          {/* 3. Brief / Excerpt of Content */}
          <div className="flex-1">
            <p
              data-testid="post-card-excerpt"
              className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed"
            >
              {post.excerpt}
            </p>
          </div>

          {/* 4. Post Media / Image (Placed directly beneath content text) */}
          {post.coverImage && (
            <div data-testid="post-card-media" className="w-full">
              <Link
                href={`/posts/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="block relative aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-800 shadow-xs group/img"
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          )}

          {/* 5. Related Tags */}
          {post.tags && post.tags.length > 0 && (
            <div data-testid="post-card-tags" className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 4).map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/explore?search=${encodeURIComponent(tag.name)}`}
                  className="text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-[#F0EFFF] hover:text-[#5B48EE] dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 px-2 py-0.5 rounded-md transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 6. Interactive Engagement Bar (Bottom) */}
          <div
            data-testid="post-card-engagement-bar"
            className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center gap-3">
              {/* Interactive Upvote / Like Button */}
              <LikeButton
                postId={post.id}
                initialLikesCount={likesCount}
                variant="card"
              />

              {/* Comments Count Indicator */}
              <Link
                href={`/posts/${post.slug}#comments`}
                title={`${commentsCount} comments`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-semibold tabular-nums">{commentsCount}</span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Share Trigger Button */}
              <button
                type="button"
                id={`card-share-btn-${post.slug}`}
                data-testid={`card-share-btn-${post.slug}`}
                aria-label={`Share ${post.title}`}
                title="Share article across platforms"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsShareOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs hover:scale-102 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </article>
      </TiltCard>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={post.title}
        slug={post.slug}
        excerpt={post.excerpt}
      />
    </>
  );
};
