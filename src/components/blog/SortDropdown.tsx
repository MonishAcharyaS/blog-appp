"use client";

import React from "react";

export type SortOption = "latest" | "likes" | "views";

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
        Sort by:
      </span>
      <div className="relative">
        <select
          id="discovery-sort-select"
          data-testid="discovery-sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          aria-label="Sort articles by"
          className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] cursor-pointer shadow-xs"
        >
          <option value="likes">Top Upvoted</option>
          <option value="latest">Latest First</option>
          <option value="views">Most Viewed</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
