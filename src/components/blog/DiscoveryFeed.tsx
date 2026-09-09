"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BlogPost, CategoryItem, PostsApiResponse } from "@/types/blog";
import { SearchBar } from "./SearchBar";
import { CategoryPills } from "./CategoryPills";
import { SortDropdown, SortOption } from "./SortDropdown";
import { BlogCard } from "./BlogCard";

interface DiscoveryFeedProps {
  initialPosts: BlogPost[];
  categories: CategoryItem[];
  initialSearchQuery?: string;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  initialPosts,
  categories,
  initialSearchQuery = "",
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState<SortOption>("latest");
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Sync external initialSearchQuery changes (e.g. navigation via navbar)
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const fetchFilteredPosts = useCallback(
    async (search: string, category: string, sort: SortOption) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (category && category !== "all") params.set("category", category);
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/posts?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: PostsApiResponse = await res.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Error fetching filtered posts:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Avoid re-fetching on mount if filters are in their default initial state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchFilteredPosts(searchQuery, selectedCategory, selectedSort);
  }, [searchQuery, selectedCategory, selectedSort, fetchFilteredPosts]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("latest");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory !== "all" || selectedSort !== "latest"
  );

  return (
    <section id="discovery-feed-section" className="space-y-8 pt-4">
      {/* Header & Controls Cluster */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Explore Stories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Curated perspectives across modern engineering, design, and architecture.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              debounceMs={300}
              placeholder="Search stories & topics..."
            />
          </div>
        </div>

        {/* Categories Bar & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-gray-100 dark:border-gray-800/80 pb-4">
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SortDropdown value={selectedSort} onChange={setSelectedSort} />
        </div>
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <div
          id="discovery-loading-skeletons"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 animate-pulse"
            >
              <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div
          id="discovery-posts-grid"
          data-testid="discovery-posts-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          id="discovery-empty-state"
          data-testid="discovery-empty-state"
          className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#5B48EE] dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No stories match your criteria
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `We couldn't find any articles matching "${searchQuery}".`
                : "There are no published articles currently available in this category."}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              id="discovery-reset-filters-btn"
              data-testid="discovery-reset-filters-btn"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5B48EE] hover:bg-[#4936E3] transition-all cursor-pointer shadow-xs"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};
