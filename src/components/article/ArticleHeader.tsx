import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { SocialShareButtons } from "./SocialShareButtons";
import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";

interface ArticleHeaderProps {
  post: BlogPost;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  post,
  initialIsLiked = false,
  initialIsBookmarked = false,
}) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const likesCount = post._count?.likes ?? 0;

  return (
    <header className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
          Home
        </Link>
        <span>/</span>
        {post.category ? (
          <Link href={`/?category=${post.category.slug}`} className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
            {post.category.name}
          </Link>
        ) : (
          <span>Articles</span>
        )}
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Badges & Reading Info */}
      <div className="flex flex-wrap items-center gap-3">
        {post.category && (
          <span
            id="article-category-badge"
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
          >
            {post.category.name}
          </span>
        )}

        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span id="article-reading-time">{post.readingTime}</span>
        </span>

        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span id="article-view-count">{post.views.toLocaleString()} views</span>
        </span>
      </div>

      {/* Article Title */}
      <h1
        id="article-title"
        className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.15]"
      >
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
        {post.excerpt}
      </p>

      {/* Author Bar & Share Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 ring-2 ring-[#5B48EE]/20 flex items-center justify-center shrink-0">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || "Author"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-[#5B48EE]">
                {post.author.name?.charAt(0) || "A"}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {post.author.name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Published on <time id="article-publish-date">{formattedDate}</time>
            </p>
          </div>
        </div>

        {/* Actions: Likes, Bookmarks & Social Share */}
        <div className="flex items-center gap-2.5">
          <LikeButton
            postId={post.id}
            initialLikesCount={likesCount}
            initialIsLiked={initialIsLiked}
            variant="header"
          />
          <BookmarkButton
            postId={post.id}
            initialIsBookmarked={initialIsBookmarked}
            variant="header"
          />
          <SocialShareButtons title={post.title} slug={post.slug} excerpt={post.excerpt} />
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-md">
          <img
            id="article-cover-image"
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </header>
  );
};
