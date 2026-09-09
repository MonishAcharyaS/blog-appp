import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { TiltCard } from "@/components/3d/TiltCard";

interface FeaturedHeroProps {
  post: BlogPost | null;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({ post }) => {
  if (!post) return null;

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TiltCard
      maxTilt={5}
      glareOpacity={0.15}
      className="w-full"
    >
      <section
        id="featured-hero-section"
        className="relative overflow-hidden rounded-3xl spatial-glass p-6 sm:p-8 lg:p-10 transition-all preserve-3d"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center preserve-3d">
        {/* Left Content Column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-[#5B48EE] to-[#818CF8] text-white shadow-xs">
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Featured Story
              </span>

              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-[#5B48EE] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  {post.category.name}
                </span>
              )}

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {post.readingTime}
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
              <Link href={`/posts/${post.slug}`} id="hero-article-title-link">
                {post.title}
              </Link>
            </h1>

            {/* Excerpt */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Author & Footer Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full ring-2 ring-[#5B48EE]/20 overflow-hidden bg-indigo-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {post.author.image ? (
                  <img
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#5B48EE]">
                    {post.author.name ? post.author.name.charAt(0).toUpperCase() : "A"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {post.author.name || "Anonymous Author"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>{post.views.toLocaleString()} views</span>
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <Link
              href={`/posts/${post.slug}`}
              id="hero-read-story-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#5B48EE] hover:bg-[#4936E3] transition-all shadow-sm hover:shadow-md hover:gap-3 cursor-pointer"
            >
              <span>Read Story</span>
              <svg
                className="w-4 h-4 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Cover Image Column */}
        <div className="lg:col-span-5 relative group">
          <Link href={`/posts/${post.slug}`} tabIndex={-1} aria-hidden="true">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-800">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <span className="text-2xl font-bold">Blogify Featured</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  </TiltCard>
  );
};
