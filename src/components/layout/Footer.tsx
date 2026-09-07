"use client";

import { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white font-sans transition-colors">
                Blogify
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B48EE]" />
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Discover stories, thinking, and expertise from writers on any topic. Built with modern web architecture and design thinking.
            </p>
            <div className="pt-2 text-xs text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Blogify Inc. All rights reserved.
            </div>
          </div>

          {/* Explore Col */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/explore?category=web-development" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/explore?category=ai-ml" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/explore?category=ui-ux" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link href="/explore?category=cloud" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Cloud Architecture
                </Link>
              </li>
              <li>
                <Link href="/explore?category=career" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Career Advice
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/about" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Writing Guidelines
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#5B48EE] dark:hover:text-[#818CF8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">
              Stay in the loop
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Receive top-rated stories in your inbox every week.
            </p>
            {subscribed ? (
              <div id="newsletter-success-toast" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] transition-all"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#5B48EE] hover:bg-[#4936E3] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
