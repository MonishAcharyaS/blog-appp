"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CommentItemType } from "@/types/blog";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
  postSlug: string;
  postAuthorId?: string;
  initialCommentsCount?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postSlug,
  postAuthorId,
  initialCommentsCount = 0,
}) => {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(initialCommentsCount);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch comments for the post
  const loadComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Handle posting top-level comment
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }

      const { comment } = await res.json();
      setComments((prev) => [comment, ...prev]);
      setTotalCount((prev) => prev + 1);
      setNewCommentText("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle posting nested reply
  const handleReply = async (parentId: string, content: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post reply");
      }

      const { comment } = await res.json();

      // Refresh list to preserve accurate flattened 2-level structure
      await loadComments();
    } catch (err: any) {
      alert(err.message || "Failed to post reply");
    }
  };

  // Handle editing comment
  const handleEdit = async (commentId: string, newContent: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to edit comment");
      }

      const { comment: updated } = await res.json();

      // Update in local state
      setComments((prev) =>
        prev.map((root) => {
          if (root.id === commentId) {
            return { ...root, content: updated.content, isEdited: true };
          }
          if (root.replies) {
            return {
              ...root,
              replies: root.replies.map((reply) =>
                reply.id === commentId
                  ? { ...reply, content: updated.content, isEdited: true }
                  : reply
              ),
            };
          }
          return root;
        })
      );
    } catch (err: any) {
      alert(err.message || "Failed to edit comment");
    }
  };

  // Handle deleting comment
  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete comment");
      }

      await loadComments();
    } catch (err: any) {
      alert(err.message || "Failed to delete comment");
    }
  };

  return (
    <section
      id="comments-section"
      data-testid="comments-section"
      className="space-y-8 pt-10 border-t border-gray-100 dark:border-gray-800"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Discussion</span>
          <span
            id="comments-count-badge"
            data-testid="comments-count-badge"
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {totalCount}
          </span>
        </h3>
      </div>

      {/* Comment Input Box (or Sign In CTA) */}
      {status === "authenticated" && session ? (
        <form
          onSubmit={handleCreateComment}
          data-testid="comment-create-form"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
        >
          {errorMessage && (
            <div
              data-testid="comment-error-alert"
              className="p-3 text-xs rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#5B48EE] dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <textarea
                id="comment-input"
                data-testid="comment-input"
                rows={3}
                placeholder="Share your thoughts or feedback..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                maxLength={2000}
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3.5 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] transition-all resize-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">
              {newCommentText.length}/2000 characters
            </span>
            <button
              id="submit-comment-btn"
              data-testid="submit-comment-btn"
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B48EE] to-[#7B68EE] hover:shadow-lg hover:shadow-[#5B48EE]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div
          id="comment-auth-prompt"
          data-testid="comment-auth-prompt"
          className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 text-center space-y-3"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Log in to participate in the conversation and reply to other readers.
          </p>
          <Link
            id="comment-login-cta"
            data-testid="comment-login-cta"
            href={`/login?callbackUrl=${encodeURIComponent(`/blog/${postSlug}`)}`}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-colors"
          >
            Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comment Thread List */}
      <div id="comments-list" data-testid="comments-list" className="space-y-2">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div
            id="no-comments-placeholder"
            data-testid="no-comments-placeholder"
            className="py-10 text-center text-sm text-gray-400"
          >
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  );
};
