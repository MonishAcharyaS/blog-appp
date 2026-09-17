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
        className="group flex flex-col h-full spatial-glass rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 preserve-3d"
      >
      {/* Thumbnail */}
      <Link
        href={`/posts/${post.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
      >
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

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Category & Read Time */}
        <div className="flex items-center justify-between gap-2">
          {post.category ? (
            <span
              data-category-slug={post.category.slug}
              className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400"
            >
              {post.category.name}
            </span>
          ) : (
            <span className="text-xs text-gray-400">General</span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{post.readingTime}</span>
        </div>

        {/* Title & Excerpt */}
        <div className="space-y-2 flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#5B48EE] dark:group-hover:text-[#818CF8] transition-colors line-clamp-2 leading-snug">
            <Link href={`/posts/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author & Metrics Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center text-[10px] font-bold text-[#5B48EE]">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name || "Author"}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author.name?.charAt(0) || "U"
              )}
            </div>
            <span className="truncate font-medium text-gray-700 dark:text-gray-300">
              {post.author.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Interactive Upvote / Like Button */}
            <LikeButton
              postId={post.id}
              initialLikesCount={likesCount}
              variant="card"
            />

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
