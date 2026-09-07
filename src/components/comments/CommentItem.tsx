"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { CommentItemType } from "@/types/blog";

interface CommentItemProps {
  comment: CommentItemType;
  postAuthorId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postAuthorId,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}) => {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [editText, setEditText] = useState<string>(comment.content);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isCommentAuthor = session?.user?.id === comment.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canDelete = isCommentAuthor || isAdmin;
  const isArticleAuthor = postAuthorId && comment.authorId === postAuthorId;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setIsReplying(false);
    } catch (err) {
      console.error("Reply submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onEdit(comment.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error("Edit submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await onDelete(comment.id);
    }
  };

  return (
    <div
      data-testid={`comment-item-${comment.id}`}
      id={`comment-${comment.id}`}
      className={`group/comment relative ${isReply ? "mt-4 ml-6 sm:ml-10 border-l-2 border-indigo-100 dark:border-indigo-950/60 pl-4" : "mt-6"}`}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 transition-colors">
        {/* Header: Author info, Role badges, Date */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-[#5B48EE] shrink-0">
              {comment.author?.image ? (
                <img
                  src={comment.author.image}
                  alt={comment.author.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                comment.author?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                {comment.author?.name || "Anonymous User"}
              </span>

              {isArticleAuthor && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#5B48EE] dark:bg-indigo-950/60 dark:text-indigo-400">
                  Author
                </span>
              )}

              {comment.author?.role === "ADMIN" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  Admin
                </span>
              )}

              <span className="text-xs text-gray-400">
                • <time>{formattedDate}</time>
              </span>

              {comment.isEdited && (
                <span
                  data-testid="edited-badge"
                  className="text-[11px] font-medium text-gray-400 italic"
                >
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Action Menu (Edit / Delete) */}
          <div className="flex items-center gap-2">
            {isCommentAuthor && !isEditing && (
              <button
                type="button"
                data-testid={`edit-comment-btn-${comment.id}`}
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-gray-500 hover:text-[#5B48EE] dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                Edit
              </button>
            )}

            {canDelete && !isEditing && (
              <button
                type="button"
                data-testid={`delete-comment-btn-${comment.id}`}
                onClick={handleDelete}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
            <textarea
              data-testid={`edit-textarea-${comment.id}`}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditText(comment.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !editText.trim()}
                data-testid={`save-edit-btn-${comment.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div
            data-testid={`comment-content-${comment.id}`}
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        )}

        {/* Reply Trigger Button */}
        {session && !isEditing && (
          <div className="pt-2 flex items-center gap-4">
            <button
              type="button"
              data-testid={`reply-comment-btn-${comment.id}`}
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B48EE] hover:text-[#4C3BDB] dark:text-indigo-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{isReplying ? "Cancel" : "Reply"}</span>
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {isReplying && (
          <form
            onSubmit={handleReplySubmit}
            data-testid={`reply-form-${comment.id}`}
            className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800"
          >
            <textarea
              data-testid={`reply-textarea-${comment.id}`}
              placeholder={`Replying to ${comment.author?.name || "user"}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              maxLength={2000}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                data-testid={`submit-reply-btn-${comment.id}`}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Render Nested Replies (2-level hierarchy) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postAuthorId={postAuthorId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
