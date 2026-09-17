"use client";

import React, { useEffect, useState, useTransition } from "react";

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  debounceMs?: number;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  debounceMs = 300,
  placeholder = "Search stories, topics, and authors...",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [, startTransition] = useTransition();

  // Sync internal state if external value changes (e.g. on reset)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce search typing only when inputValue differs from current external value
  useEffect(() => {
    if (inputValue === value) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        onChange(inputValue);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, value, debounceMs, onChange]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        id="discovery-search-input"
        data-testid="discovery-search-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className="w-full pl-10 pr-10 py-3 rounded-2xl spatial-glass text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5B48EE] focus:border-transparent transition-all shadow-md focus:shadow-[0_0_20px_rgba(91,72,238,0.25)]"
      />

      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          id="discovery-search-clear-btn"
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
