"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, searchQuery]);

  // Toggle publish state
  const handleTogglePublish = async (post: BlogPost) => {
    const nextPublished = !post.published;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, published: nextPublished } : p))
    );

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextPublished }),
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
    } catch (err) {
      console.error(err);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: post.published } : p))
      );
    }
  };

  // Toggle featured state
  const handleToggleFeatured = async (post: BlogPost) => {
    const nextFeatured = !post.isFeatured;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isFeatured: nextFeatured } : p))
    );

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
      if (!res.ok) throw new Error("Failed to toggle featured status");
    } catch (err) {
      console.error(err);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isFeatured: post.isFeatured } : p))
      );
    }
  };

  // Execute deletion
  const handleDeletePost = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/posts/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete article");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Manage Articles
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, edit, feature, and publish articles across the platform.
          </p>
        </div>
        <Link
          id="new-article-btn"
          data-testid="new-article-btn"
          href="/admin/posts/new"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Article</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {(["all", "published", "draft"] as const).map((tab) => (
            <button
              key={tab}
              id={`filter-tab-${tab}`}
              data-testid={`filter-tab-${tab}`}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <input
            id="admin-posts-search"
            data-testid="admin-posts-search"
            type="text"
            placeholder="Search articles by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
          />
        </div>
      </div>

      {/* Articles Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table
            id="admin-posts-table"
            data-testid="admin-posts-table"
            className="w-full text-left text-xs"
          >
            <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Article Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Publication</th>
                <th className="px-5 py-3.5">Featured</th>
                <th className="px-5 py-3.5">Views & Likes</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Loading articles...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    id="no-posts-found"
                    data-testid="no-posts-found"
                    className="text-center py-12 text-gray-400"
                  >
                    No articles found matching the current filters.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    id={`post-row-${post.slug}`}
                    data-testid={`post-row-${post.slug}`}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        /blog/{post.slug}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {post.category?.name || "General"}
                    </td>

                    {/* Publish Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        id={`toggle-publish-${post.slug}`}
                        data-testid={`toggle-publish-${post.slug}`}
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          post.published
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{post.published ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        id={`toggle-featured-${post.slug}`}
                        data-testid={`toggle-featured-${post.slug}`}
                        onClick={() => handleToggleFeatured(post)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          post.isFeatured
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <svg className={`w-3.5 h-3.5 ${post.isFeatured ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{post.isFeatured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>

                    {/* Views & Engagement */}
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <span>{post.views} views</span>
                        <span>•</span>
                        <span>{post._count?.likes ?? 0} likes</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link
                        id={`edit-post-${post.slug}`}
                        data-testid={`edit-post-${post.slug}`}
                        href={`/admin/posts/${post.id}/edit`}
                        className="px-2.5 py-1 rounded-lg font-bold text-xs text-[#5B48EE] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        id={`delete-post-${post.slug}`}
                        data-testid={`delete-post-${post.slug}`}
                        onClick={() => setDeleteTarget(post)}
                        className="px-2.5 py-1 rounded-lg font-bold text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          id="delete-post-modal"
          data-testid="delete-post-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Article
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Are you sure you want to permanently delete{" "}
                <strong>&quot;{deleteTarget.title}&quot;</strong>? This action cannot be undone and will remove all likes and comments.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="cancel-delete-btn"
                data-testid="cancel-delete-btn"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                data-testid="confirm-delete-btn"
                disabled={isDeleting}
                onClick={handleDeletePost}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
