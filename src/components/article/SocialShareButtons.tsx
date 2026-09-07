"use client";

import React, { useState } from "react";

interface SocialShareButtonsProps {
  title: string;
  slug: string;
  variant?: "header" | "footer";
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  slug,
  variant = "header",
}) => {
  const [copied, setCopied] = useState(false);

  const getArticleUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${slug}`;
    }
    return `/blog/${slug}`;
  };

  const handleCopyLink = async () => {
    const url = getArticleUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback
        const el = document.createElement("textarea");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleTwitterShare = () => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(`Reading "${title}" on Blogify`);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const prefix = variant === "footer" ? "footer-" : "";

  return (
    <div id={`${prefix}social-share-cluster`} className="flex items-center gap-2 py-4">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
        Share:
      </span>

      {/* Copy Link Button */}
      <div className="relative">
        <button
          type="button"
          id={`${prefix}share-copy-link-btn`}
          aria-label="Copy link to clipboard"
          title="Copy link"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {copied && (
          <span
            id={`${prefix}share-copied-toast`}
            role="status"
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded-md shadow-lg whitespace-nowrap animate-fade-in"
          >
            Link copied!
          </span>
        )}
      </div>

      {/* Twitter / X */}
      <button
        type="button"
        id={`${prefix}share-twitter-btn`}
        aria-label="Share on X / Twitter"
        title="Share on X"
        onClick={handleTwitterShare}
        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        type="button"
        id={`${prefix}share-linkedin-btn`}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        onClick={handleLinkedInShare}
        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      </button>
    </div>
  );
};
