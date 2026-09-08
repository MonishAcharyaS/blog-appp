"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminCommentItem } from "@/types/blog";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminCommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch comments
  const fetchComments = async (query = "") => {
    try {
      setLoading(true);
      const url = query
        ? `/api/admin/comments?search=${encodeURIComponent(query)}`
        : `/api/admin/comments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(searchQuery);
  }, [searchQuery]);

  // Execute comment deletion
  const handleDeleteComment = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/comments/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      // Optimistically remove comment and any nested replies if parent
      setComments((prev) =>
        prev.filter(
          (c) => c.id !== deleteTarget.id && c.parentId !== deleteTarget.id
        )
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Comment Moderation
            </h1>
            <span
              id="total-comments-badge"
              data-testid="total-comments-badge"
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#5B48EE] dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
            >
              {comments.length} total
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review, search, inspect, and moderate reader comments and discussion threads across all articles.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            id="admin-comments-search"
            data-testid="admin-comments-search"
            type="text"
            placeholder="Search by comment text, author name, or article title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#5B48EE]/20 focus:border-[#5B48EE]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {searchQuery && (
          <button
            id="reset-comments-search-btn"
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline self-start sm:self-auto cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Moderation Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table
            id="admin-comments-table"
            data-testid="admin-comments-table"
            className="w-full text-left text-xs"
          >
            <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Comment</th>
                <th className="px-5 py-3.5">Article</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#5B48EE] border-t-transparent animate-spin" />
                      <span>Loading comments...</span>
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="space-y-3">
                      <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                        No comments found
                      </p>
                      {searchQuery && (
                        <p className="text-xs text-gray-500">
                          Try searching for a different term or{" "}
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-[#5B48EE] underline font-bold cursor-pointer"
                          >
                            reset the filter
                          </button>
                          .
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr
                    key={comment.id}
                    id={`comment-row-${comment.id}`}
                    data-testid={`comment-row-${comment.id}`}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Author Cell */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {comment.author.image ? (
                            <img
                              src={comment.author.image}
                              alt={comment.author.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            comment.author.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {comment.author.name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {comment.author.email}
                          </p>
                        </div>
                        {comment.author.role === "ADMIN" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Comment Content Cell */}
                    <td className="px-5 py-4 max-w-md">
                      {comment.parentId && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#5B48EE] dark:text-indigo-400 mb-1">
                          <span>↳ Reply to:</span>
                          <span className="text-gray-400 italic truncate max-w-[180px]">
                            {comment.parent?.author.name || "Comment"}
                          </span>
                        </div>
                      )}
                      <p
                        id={`comment-content-${comment.id}`}
                        className="text-gray-800 dark:text-gray-200 line-clamp-3 leading-relaxed"
                      >
                        {comment.content}
                      </p>
                      {comment._count && comment._count.replies > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                          <span>•</span>
                          <span>
                            {comment._count.replies} nested{" "}
                            {comment._count.replies === 1 ? "reply" : "replies"}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Article Reference Cell */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <Link
                        id={`comment-post-link-${comment.id}`}
                        data-testid={`comment-post-link-${comment.id}`}
                        href={`/blog/${comment.post.slug}`}
                        target="_blank"
                        className="font-bold text-[#5B48EE] dark:text-[#818CF8] hover:underline block truncate"
                        title={comment.post.title}
                      >
                        {comment.post.title}
                      </Link>
                      <span className="text-[10px] text-gray-400 font-mono block truncate">
                        /blog/{comment.post.slug}
                      </span>
                    </td>

                    {/* Timestamp Cell */}
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions Cell */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        id={`delete-comment-${comment.id}`}
                        data-testid={`delete-comment-${comment.id}`}
                        onClick={() => setDeleteTarget(comment)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Comment"
                        aria-label={`Delete comment by ${comment.author.name || "author"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
          id="delete-comment-modal"
          data-testid="delete-comment-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Delete Comment?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to permanently delete this comment by{" "}
                <strong className="text-gray-900 dark:text-white font-bold">
                  {deleteTarget.author.name || "author"}
                </strong>
                ?
              </p>
              {deleteTarget._count && deleteTarget._count.replies > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-700 dark:text-amber-300 text-[11px] font-semibold text-left">
                  ⚠️ <strong>Cascade Warning:</strong> This comment has{" "}
                  {deleteTarget._count.replies}{" "}
                  {deleteTarget._count.replies === 1 ? "reply" : "replies"} which will
                  also be permanently deleted.
                </div>
              )}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-left text-xs italic text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 max-h-24 overflow-y-auto">
                &ldquo;{deleteTarget.content}&rdquo;
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="cancel-delete-comment-btn"
                data-testid="cancel-delete-comment-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-comment-btn"
                data-testid="confirm-delete-comment-btn"
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
