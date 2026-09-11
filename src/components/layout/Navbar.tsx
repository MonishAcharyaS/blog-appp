"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search input state & ref
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMac, setIsMac] = useState(false);

  // Platform detection for shortcut symbol (Cmd+K on Mac, Ctrl+K on Windows/Linux)
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const platform = (navigator as any)?.userAgentData?.platform || navigator?.platform || "";
      setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
    }
  }, []);

  // Sync search input with URL search param when on /explore without bailing out static pre-renders
  useEffect(() => {
    if (pathname.startsWith("/explore")) {
      const urlParams = new URLSearchParams(window.location.search);
      const currentParam = urlParams.get("search") || "";
      setSearchQuery(currentParam);
    }
  }, [pathname]);

  // Focus and select search bar
  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleFocusSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      if (pathname === "/explore") {
        router.push("/explore");
      }
      return;
    }
    router.push(`/explore?search=${encodeURIComponent(trimmed)}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (pathname.startsWith("/explore")) {
      router.push("/explore");
    }
    searchInputRef.current?.focus();
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const isAdmin = session?.user?.role === "ADMIN";
  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "U";

  const isFeedActive = pathname === "/";
  const isExploreActive = pathname.startsWith("/explore");
  const isTrendingActive = pathname.startsWith("/trending");

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 px-3 sm:px-6 pt-2 sm:pt-3">
      <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl spatial-nav-dock px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4 transition-all duration-300">
        {/* Brand Logo & Main Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            id="navbar-brand-logo"
            href="/"
            className="flex items-center gap-1.5 group focus:outline-none"
          >
            <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white font-sans transition-colors group-hover:text-[#5B48EE] dark:group-hover:text-[#818CF8]">
              Blogify
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B48EE] shadow-[0_0_12px_rgba(91,72,238,0.8)] animate-pulse" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              id="navbar-feed-link"
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isFeedActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Feed
            </Link>
            <Link
              id="navbar-explore-link"
              href="/explore"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isExploreActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Explore
            </Link>
            <Link
              id="navbar-trending-link"
              href="/trending"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isTrendingActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Trending
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form
          id="navbar-search-form"
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex items-center flex-1 max-w-sm mx-4"
        >
          <div className="relative w-full">
            <button
              type="submit"
              id="navbar-search-submit-btn"
              data-testid="navbar-search-submit-btn"
              aria-label="Submit search"
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-[#5B48EE] dark:text-gray-500 dark:hover:text-[#818CF8] cursor-pointer transition-colors"
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
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <input
              ref={searchInputRef}
              id="navbar-search-input"
              data-testid="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search blogs, authors, topics..."
              className="w-full pl-9 pr-14 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] focus:bg-white dark:focus:bg-gray-800 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  id="navbar-search-clear-btn"
                  data-testid="navbar-search-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  id="navbar-search-shortcut-btn"
                  data-testid="navbar-search-shortcut-btn"
                  onClick={handleFocusSearch}
                  aria-label={`Focus search input (Shortcut: ${isMac ? "Cmd+K" : "Ctrl+K"})`}
                  title={`Focus search (${isMac ? "⌘K" : "Ctrl+K"})`}
                  className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 rounded transition-all cursor-pointer select-none active:scale-95 shadow-2xs"
                >
                  <span id="navbar-search-shortcut-badge" data-testid="navbar-search-shortcut-badge">
                    {isMac ? "⌘K" : "Ctrl K"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Right Actions Cluster */}
        <div className="flex items-center gap-3">
          {/* Write / New Post CTA Button */}
          <Link
            id="nav-new-post-btn"
            data-testid="nav-new-post-btn"
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B48EE] hover:bg-[#4C3BDB] active:scale-95 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:rotate-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="hidden sm:inline">Write</span>
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* Admin Dashboard Badge (if role === ADMIN) */}
          {isAdmin && (
            <Link
              id="navbar-admin-dashboard-link"
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              Admin Dashboard
            </Link>
          )}

          {/* Auth State: Anonymous Visitor vs Logged-In User */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ) : session?.user ? (
            /* User Avatar & Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Open user menu"
                aria-expanded={profileDropdownOpen}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#5B48EE] text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-100 dark:ring-purple-950">
                  {userInitial}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 max-w-[110px]">
                    {session.user.name || "Reader"}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                    {session.user.role?.toLowerCase() || "reader"}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {session.user.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 truncate text-[11px]">
                      {session.user.email}
                    </p>
                  </div>

                  {/* Create New Post Link in Dropdown */}
                  <Link
                    id="dropdown-new-post-link"
                    data-testid="dropdown-new-post-link"
                    href="/admin/posts/new"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#5B48EE] dark:text-[#818CF8] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Create New Post</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      id="dropdown-admin-link"
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40"
                    >
                      <span>Admin Control Center</span>
                    </Link>
                  )}

                  <Link
                    id="dropdown-bookmarks-link"
                    data-testid="dropdown-bookmarks-link"
                    href="/bookmarks"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <span>My Bookmarks</span>
                  </Link>

                  <Link
                    href="/test-auth"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <span>Account Profile</span>
                  </Link>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                  <button
                    id="navbar-signout-btn"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Visitor Buttons */
            <div className="flex items-center gap-2">
              <Link
                id="navbar-signin-btn"
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                id="navbar-register-btn"
                href="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B48EE] hover:bg-[#4936E3] rounded-xl shadow-xs transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation drawer"
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3 transition-colors duration-200"
        >
          {/* Mobile Search */}
          <form
            id="mobile-navbar-search-form"
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setMobileMenuOpen(false);
            }}
            className="relative"
          >
            <input
              ref={mobileSearchInputRef}
              id="mobile-navbar-search-input"
              data-testid="mobile-navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs, authors, topics..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            />
            <button
              type="submit"
              id="mobile-navbar-search-submit-btn"
              data-testid="mobile-navbar-search-submit-btn"
              aria-label="Submit mobile search"
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-[#5B48EE] cursor-pointer"
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
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {searchQuery && (
              <button
                type="button"
                id="mobile-navbar-search-clear-btn"
                data-testid="mobile-navbar-search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear mobile search"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </form>

          <div className="flex flex-col space-y-1 text-sm font-medium">
            {/* Mobile New Post CTA */}
            <Link
              id="mobile-nav-new-post-btn"
              data-testid="mobile-nav-new-post-btn"
              href="/admin/posts/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#5B48EE] text-white font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>+ Create New Post</span>
            </Link>

            <Link
              id="mobile-nav-feed-link"
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isFeedActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Feed
            </Link>
            <Link
              id="mobile-nav-explore-link"
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isExploreActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Explore
            </Link>
            <Link
              id="mobile-nav-trending-link"
              href="/trending"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isTrendingActive
                  ? "bg-[#5B48EE]/10 text-[#5B48EE] dark:text-[#818CF8] font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Trending
            </Link>
            {isAdmin && (
              <Link
                id="mobile-admin-link"
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                Admin Dashboard
              </Link>
            )}
            {session && (
              <Link
                id="mobile-nav-bookmarks-link"
                data-testid="mobile-nav-bookmarks-link"
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Bookmarks
              </Link>
            )}
          </div>

          {!session && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#5B48EE] rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
