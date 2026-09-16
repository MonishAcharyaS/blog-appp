"use client";

import React, { useState, useEffect, useRef } from "react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  excerpt?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  slug,
  excerpt = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const getArticleUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${slug}`;
    }
    return `/blog/${slug}`;
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  // Keyboard navigation: dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const url = getArticleUrl();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`"${title}" on Blogify`);
  const encodedTextWithUrl = encodeURIComponent(`Check out "${title}" on Blogify: ${url}`);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
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

  const openShareWindow = (targetUrl: string, width = 600, height = 500) => {
    window.open(targetUrl, "_blank", `noopener,noreferrer,width=${width},height=${height}`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url,
        });
      } catch (err) {
        // User cancelled or share aborted
        console.log("Native share dismissed or aborted:", err);
      }
    }
  };

  const shareDestinations = [
    {
      id: "share-whatsapp-btn",
      name: "WhatsApp",
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
        </svg>
      ),
      action: () =>
        openShareWindow(`https://api.whatsapp.com/send?text=${encodedTextWithUrl}`, 600, 500),
    },
    {
      id: "share-twitter-btn",
      name: "Twitter / X",
      color: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          600,
          400
        ),
    },
    {
      id: "share-linkedin-btn",
      name: "LinkedIn",
      color: "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
      action: () =>
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          600,
          500
        ),
    },
    {
      id: "share-facebook-btn",
      name: "Facebook",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
        </svg>
      ),
      action: () =>
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, 600, 500),
    },
    {
      id: "share-reddit-btn",
      name: "Reddit",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      action: () =>
        openShareWindow(
          `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
          650,
          550
        ),
    },
    {
      id: "share-telegram-btn",
      name: "Telegram",
      color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:hover:bg-cyan-900/50 border-cyan-200 dark:border-cyan-800",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      ),
      action: () =>
        openShareWindow(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
          600,
          500
        ),
    },
    {
      id: "share-instagram-btn",
      name: "Instagram",
      color: "bg-gradient-to-tr from-amber-50 via-rose-50 to-purple-50 text-rose-600 hover:from-amber-100 hover:via-rose-100 hover:to-purple-100 dark:from-purple-950/40 dark:via-rose-950/40 dark:to-amber-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      action: async () => {
        await handleCopyLink();
        openShareWindow("https://www.instagram.com/", 650, 600);
      },
    },
  ];

  return (
    <div
      id="social-share-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        ref={modalRef}
        id="social-share-modal"
        data-testid="social-share-modal"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all p-6 sm:p-7 space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div>
              <h3 id="share-modal-title" className="text-base font-bold text-gray-900 dark:text-white">
                Share this article
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share perspectives with your network or community
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-share-modal-btn"
            data-testid="close-share-modal-btn"
            aria-label="Close share dialog"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Article Summary Capsule */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800/80">
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
            {title}
          </p>
          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {url}
          </p>
        </div>

        {/* Social Platforms Grid */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Destinations
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {shareDestinations.map((platform) => (
              <button
                key={platform.id}
                type="button"
                id={platform.id}
                data-testid={platform.id}
                onClick={platform.action}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer group shadow-2xs hover:scale-105 active:scale-95 ${platform.color}`}
                title={`Share on ${platform.name}`}
              >
                <div className="transition-transform duration-200 group-hover:-translate-y-0.5">
                  {platform.icon}
                </div>
                <span className="text-[11px] font-semibold mt-1.5 text-center leading-none">
                  {platform.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Native Device Share Sheet Option (Mobile & Supporting Desktops) */}
        {canNativeShare && (
          <button
            type="button"
            id="share-native-btn"
            data-testid="share-native-btn"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Share via System Share Sheet (Instagram, Messaging & More)</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label htmlFor="share-copy-url-input" className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Page Link
          </label>
          <div className="relative flex items-center">
            <input
              id="share-copy-url-input"
              data-testid="share-copy-url-input"
              type="text"
              readOnly
              value={url}
              className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-200 focus:outline-none select-all"
            />
            <button
              type="button"
              id="share-copy-link-btn"
              data-testid="share-copy-link-btn"
              onClick={handleCopyLink}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-[#5B48EE] hover:bg-[#4936E3] text-white text-xs font-semibold transition-all duration-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Toast Notification */}
          {copied && (
            <div
              id="share-copied-toast"
              data-testid="share-copied-toast"
              role="status"
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in"
            >
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Link copied to clipboard!</span>
            </div>
          )}
        </div>

        {/* QR Code Quick Toggle Section */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            type="button"
            id="share-qr-toggle-btn"
            data-testid="share-qr-toggle-btn"
            onClick={() => setShowQR(!showQR)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>{showQR ? "Hide QR Code" : "Scan on Mobile / QR Code"}</span>
          </button>

          <span className="text-[11px] text-gray-400">Press Esc to exit</span>
        </div>

        {/* QR Code Display Container */}
        {showQR && (
          <div
            id="share-qr-container"
            data-testid="share-qr-container"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 animate-fade-in text-center space-y-2"
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedUrl}`}
              alt={`QR Code for ${title}`}
              className="w-36 h-36 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs bg-white p-1.5"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Scan with camera to read and share on your phone
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
