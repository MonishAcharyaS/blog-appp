"use client";

import React, { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialIsLiked?: boolean;
  variant?: "header" | "footer" | "card";
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikesCount,
  initialIsLiked = false,
  variant = "header",
  className = "",
}) => {
  const { data: session, status } = useSession();
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [_isPending, _startTransition] = useTransition();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Synchronize authenticated user's like state on mount
  React.useEffect(() => {
    if (status === "authenticated" && session?.user && initialIsLiked === false) {
      let isMounted = true;
      fetch(`/api/posts/${postId}/like`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && isMounted) {
            setIsLiked(data.liked);
            setLikesCount(data.likesCount);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [postId, status, session, initialIsLiked]);

  const prefix = variant;

  const handleLikeToggle = async () => {
    // If not authenticated, open login prompt modal
    if (status !== "authenticated" || !session) {
      setShowAuthModal(true);
      return;
    }

    // Optimistic Update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    const nextIsLiked = !previousIsLiked;
    const nextLikesCount = nextIsLiked
      ? previousLikesCount + 1
      : Math.max(0, previousLikesCount - 1);

    setIsLiked(nextIsLiked);
    setLikesCount(nextLikesCount);
    if (nextIsLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await res.json();
      // Sync strictly with server response
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error("Like toggle error:", error);
      // Rollback optimistic state
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    }
  };

  const isCard = variant === "card";

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        id={isCard ? `card-upvote-btn-${postId}` : `${prefix}-like-btn`}
        data-testid={isCard ? "card-upvote-btn" : `${prefix}-like-btn`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLikeToggle();
        }}
        aria-label={isLiked ? "Unlike post" : "Upvote post"}
        title={isLiked ? "Unlike post" : "Upvote post"}
        className={`group inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          isCard
            ? `px-2.5 py-1 ${
                isLiked
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800/80 dark:text-rose-400 shadow-2xs"
                  : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50/40 dark:hover:border-rose-900/50 dark:hover:text-rose-400"
              }`
            : `px-3.5 py-1.5 ${
                isLiked
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400 shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50/50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-rose-900/60 dark:hover:text-rose-400 dark:hover:bg-rose-950/20"
              }`
        } ${isAnimating ? "scale-110" : "scale-100"} active:scale-95`}
      >
        <svg
          id={isCard ? `card-upvote-icon-${postId}` : `${prefix}-like-icon`}
          className={`${isCard ? "w-3.5 h-3.5" : "w-4 h-4"} transition-transform duration-300 ${
            isLiked
              ? "fill-rose-500 text-rose-500 scale-110"
              : "fill-none stroke-current group-hover:text-rose-500 group-hover:scale-110"
          }`}
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span
          id={isCard ? `card-upvote-count-${postId}` : `${prefix}-like-count`}
          data-testid={isCard ? "card-upvote-count" : `${prefix}-like-count`}
          className="font-bold tabular-nums text-[11px]"
        >
          {likesCount}
        </span>
      </button>

      {/* Auth Prompt Modal / Popup for Anonymous Users */}
      {showAuthModal && (
        <div
          id={`${prefix}-auth-modal`}
          data-testid="like-auth-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 fill-rose-500" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sign in to Like
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Join our community to appreciate authors, bookmark articles, and join the discussion.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                id={`${prefix}-modal-login-btn`}
                href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B48EE] to-[#7B68EE] hover:shadow-lg hover:shadow-[#5B48EE]/20 transition-all text-center"
              >
                Sign In / Register
              </Link>
              <button
                id={`${prefix}-modal-cancel-btn`}
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
