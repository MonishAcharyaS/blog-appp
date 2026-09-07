"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface AdminSidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userName,
  userEmail,
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Overview",
      href: "/admin",
      id: "admin-nav-overview",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Write Article",
      href: "/admin/editor-test",
      id: "admin-nav-editor",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B48EE] to-[#818CF8] flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base">
            Admin Center
          </span>
        </div>
        <button
          type="button"
          id="admin-mobile-menu-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        data-testid="admin-sidebar"
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col justify-between w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0 min-h-screen p-5`}
      >
        <div className="space-y-6">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B48EE] to-[#818CF8] flex items-center justify-center text-white font-black text-base shadow-sm">
              B
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white block leading-tight">
                Blogify
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  id={item.id}
                  data-testid={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#5B48EE] text-white shadow-sm shadow-[#5B48EE]/20"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Return to Website, Admin User Info, Sign Out */}
        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          {/* Return to Website Link */}
          <Link
            id="return-to-site-link"
            data-testid="return-to-site-link"
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#5B48EE] hover:bg-indigo-50/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to Website</span>
          </Link>

          {/* Admin User Card */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {userName || "Administrator"}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {userEmail || "admin@example.com"}
              </p>
            </div>
            <button
              type="button"
              id="admin-logout-btn"
              data-testid="admin-logout-btn"
              title="Sign Out"
              aria-label="Sign out"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
