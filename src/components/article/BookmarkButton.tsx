"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked?: boolean;
  variant?: "header" | "footer" | "card";
  className?: string;
  onToggleSuccess?: (newBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  initialIsBookmarked = false,
  variant = "header",
  className = "",
  onToggleSuccess,
}) => {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Sync state if initialIsBookmarked changes (e.g. on page navigation or server revalidation)
  React.useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

  const prefix = variant;

  const handleBookmarkToggle = async () => {
    if (status !== "authenticated" || !session) {
      setShowAuthModal(true);
      return;
    }

    if (isLoading) return;

    // Optimistic Update
    const previous = isBookmarked;
    const next = !previous;
    setIsBookmarked(next);
    if (next) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to toggle bookmark");
      }

      const data = await res.json();
      setIsBookmarked(data.bookmarked);
      if (onToggleSuccess) {
        onToggleSuccess(data.bookmarked);
      }
    } catch {
      // Revert optimistic update on failure
      setIsBookmarked(previous);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        id={`${prefix}-bookmark-btn`}
        data-testid={`${prefix}-bookmark-btn`}
        onClick={handleBookmarkToggle}
        disabled={isLoading}
        aria-label={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
        className={`relative flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
          variant === "card"
            ? "p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xs hover:scale-105"
            : "px-3.5 py-2 border"
        } ${
          isBookmarked
            ? "bg-[#5B48EE] text-white border-[#5B48EE] shadow-sm shadow-[#5B48EE]/20 hover:bg-[#4C3BDB]"
            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80"
        } ${className}`}
      >
        <svg
          id={`${prefix}-bookmark-icon`}
          data-testid={`${prefix}-bookmark-icon`}
          className={`w-4 h-4 transition-transform duration-300 ${
            isAnimating ? "scale-125" : "scale-100"
          }`}
          fill={isBookmarked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isBookmarked ? 1.5 : 2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>

        {variant !== "card" && (
          <span
            id={`${prefix}-bookmark-label`}
            data-testid={`${prefix}-bookmark-label`}
            className="hidden sm:inline"
          >
            {isBookmarked ? "Saved" : "Save"}
          </span>
        )}
      </button>

      {/* Unauthenticated Login Modal Prompt */}
      {showAuthModal && (
        <div
          id={`${prefix}-bookmark-auth-modal`}
          data-testid="bookmark-auth-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#5B48EE]/10 dark:bg-[#5B48EE]/20 text-[#5B48EE] flex items-center justify-center mx-auto">
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Save for Later
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create an account or sign in to bookmark your favorite articles and access them anytime in My Bookmarks.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login?callbackUrl=/bookmarks"
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-colors shadow-sm"
              >
                Sign In to Save
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
