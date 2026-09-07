"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { CategoryItem } from "@/types/blog";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("<p>Write your article content here...</p>");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Article title is required.");
      return;
    }

    const strippedContent = content.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      setErrorMessage("Article content cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          excerpt: excerpt.trim() || trimmedTitle,
          content,
          coverImage: coverImage.trim() || null,
          categoryId: categoryId || null,
          published,
          isFeatured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create article");
      }

      router.push("/admin/posts");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Create New Article
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Draft or publish a rich multimedia article on Blogify.
        </p>
      </div>

      {errorMessage && (
        <div
          id="post-form-error"
          data-testid="post-form-error"
          className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-semibold"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Article Title <span className="text-red-500">*</span>
          </label>
          <input
            id="post-title-input"
            data-testid="post-title-input"
            type="text"
            placeholder="e.g., Designing Scalable Micro-Frontends"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className="w-full text-base font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            required
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Short Excerpt / Summary
          </label>
          <textarea
            id="post-excerpt-input"
            data-testid="post-excerpt-input"
            rows={2}
            placeholder="A brief teaser to capture readers in the discovery grid..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
          />
        </div>

        {/* Category & Cover Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="post-category-select"
              data-testid="post-category-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            >
              <option value="">Select Category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Cover Image URL
            </label>
            <input
              id="post-cover-image-input"
              data-testid="post-cover-image-input"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Article Content
          </label>
          <RichTextEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (errorMessage) setErrorMessage("");
            }}
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              id="post-published-checkbox"
              data-testid="post-published-checkbox"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#5B48EE] focus:ring-[#5B48EE]"
            />
            <span>Publish Immediately</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              id="post-featured-checkbox"
              data-testid="post-featured-checkbox"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Feature on Discovery Hero</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-post-btn"
            data-testid="save-post-btn"
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving Article..." : "Save Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
