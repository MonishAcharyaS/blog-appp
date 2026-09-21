"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ThumbsUpButtonProps {
  postId: string;
  initialThumbsCount?: number;
  initialIsEndorsed?: boolean;
  variant?: "header" | "footer" | "card";
  className?: string;
}

export const ThumbsUpButton: React.FC<ThumbsUpButtonProps> = ({
  postId,
  initialThumbsCount,
  initialIsEndorsed = false,
  variant = "card",
  className = "",
}) => {
  const { data: session, status } = useSession();
  const [thumbsCount, setThumbsCount] = useState<number>(() => {
    if (typeof initialThumbsCount === "number") return initialThumbsCount;
    // Deterministic seed count based on postId hash for rich initial UI
    let hash = 0;
    for (let i = 0; i < postId.length; i++) {
      hash = (hash << 5) - hash + postId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 15) + 3;
  });
  const [isEndorsed, setIsEndorsed] = useState<boolean>(initialIsEndorsed);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Sync state from localStorage for persistent feedback per user/browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedKey = `thumbs_up_${postId}`;
        const stored = localStorage.getItem(storedKey);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          setIsEndorsed(parsed.endorsed);
          if (typeof parsed.count === "number") {
            setThumbsCount(parsed.count);
          }
        }
      } catch (e) {}
    }
  }, [postId]);

  const handleToggle = () => {
    // If not authenticated, open login prompt modal
    if (status !== "authenticated" || !session) {
      setShowAuthModal(true);
      return;
    }

    // Trigger micro-scale spring animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const nextEndorsed = !isEndorsed;
    const nextCount = nextEndorsed ? thumbsCount + 1 : Math.max(0, thumbsCount - 1);

    setIsEndorsed(nextEndorsed);
    setThumbsCount(nextCount);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `thumbs_up_${postId}`,
          JSON.stringify({ endorsed: nextEndorsed, count: nextCount })
        );
      } catch (e) {}
    }
  };

  const isCard = variant === "card";

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        id={isCard ? `card-thumbs-up-btn-${postId}` : `${variant}-thumbs-up-btn`}
        data-testid={isCard ? "card-thumbs-up-btn" : `${variant}-thumbs-up-btn`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        aria-label={isEndorsed ? "Retract thumbs up" : "Thumbs up post"}
        title={isEndorsed ? "Retract thumbs up" : "Thumbs up post"}
        className={`group inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          isCard
            ? `px-2.5 py-1 ${
                isEndorsed
                  ? "bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-700/80 dark:text-emerald-400 shadow-2xs"
                  : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 dark:hover:border-emerald-800/60 dark:hover:text-emerald-400"
              }`
            : `px-3.5 py-1.5 ${
                isEndorsed
                  ? "bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-700/60 dark:text-emerald-400 shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-emerald-800/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20"
              }`
        } ${isAnimating ? "scale-110" : "scale-100"} active:scale-95`}
      >
        <svg
          id={isCard ? `card-thumbs-up-icon-${postId}` : `${variant}-thumbs-up-icon`}
          className={`${isCard ? "w-3.5 h-3.5" : "w-4 h-4"} transition-transform duration-300 ${
            isEndorsed
              ? "fill-emerald-500 text-emerald-500 scale-110"
              : "fill-none stroke-current group-hover:text-emerald-500 group-hover:scale-110"
          }`}
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          {/* Thumbs Up SVG Icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.434.887 1.34 1.398 2.33 1.398h4.976c.618 0 1.217-.247 1.605-.729a11.95 11.95 0 002.649-7.521c0-.435-.023-.863-.068-1.285C17.557 10.194 16.638 9.5 15.612 9.5H12.48c-.618 0-.991-.724-.725-1.282.463-.975.723-2.066.723-3.218A2.25 2.25 0 0010.228 2.75a.75.75 0 00-.75.75v.633c0 .584-.11 1.16-.322 1.672-.303.759-.93 1.331-1.653 1.715a9.04 9.04 0 00-2.861 2.4c-.498.634-1.225 1.08-2.031 1.08H2.25v9h3.654z"
          />
        </svg>
        <span
          id={isCard ? `card-thumbs-up-count-${postId}` : `${variant}-thumbs-up-count`}
          data-testid={isCard ? "card-thumbs-up-count" : `${variant}-thumbs-up-count`}
          className="tabular-nums"
        >
          {thumbsCount}
        </span>
      </button>

      {/* Guest Authentication Modal */}
      {showAuthModal && (
        <div
          data-testid="thumbs-auth-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowAuthModal(false);
          }}
        >
          <div
            className="spatial-glass relative w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 border border-white/20 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Thumbs Up Article
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Join our community or log in to endorse this article and support creators.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-white bg-gradient-to-r from-[#5B48EE] to-[#818CF8] hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
