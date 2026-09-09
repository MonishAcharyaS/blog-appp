"use client";

import React from "react";
import { CategoryItem } from "@/types/blog";

interface CategoryPillsProps {
  categories: CategoryItem[];
  selectedCategory: string; // slug or 'all'
  onSelectCategory: (slug: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div
      id="category-pills-container"
      className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
    >
      <button
        type="button"
        id="category-pill-all"
        onClick={() => onSelectCategory("all")}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
          selectedCategory === "all" || !selectedCategory
            ? "bg-[#5B48EE] text-white shadow-[0_4px_14px_rgba(91,72,238,0.4)] scale-105"
            : "spatial-glass text-gray-700 dark:text-gray-300 hover:scale-102 hover:text-[#5B48EE] dark:hover:text-[#818CF8]"
        }`}
      >
        All Topics
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            id={`category-pill-${cat.slug}`}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-[#5B48EE] text-white shadow-[0_4px_14px_rgba(91,72,238,0.4)] scale-105"
                : "spatial-glass text-gray-700 dark:text-gray-300 hover:scale-102 hover:text-[#5B48EE] dark:hover:text-[#818CF8]"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
