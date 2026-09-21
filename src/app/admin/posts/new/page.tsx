"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUploadDropzone } from "@/components/common/ImageUploadDropzone";
import { AiWritingModal, AiModalMode } from "@/components/editor/AiWritingModal";
import { AiImageModal } from "@/components/editor/AiImageModal";
import { CategoryItem } from "@/types/blog";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("<p>Write your article content here...</p>");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [published, setPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // AI Writing Assistant state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<AiModalMode>("generate");

  // AI Image Studio state
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);

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

    // Validation for Other / Custom Category
    if (categoryId === "OTHER") {
      const trimmedCustom = customCategoryName.trim();
      if (!trimmedCustom) {
        setErrorMessage("Please enter a name for the new custom category.");
        return;
      }
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload: any = {
        title: trimmedTitle,
        excerpt: excerpt.trim() || trimmedTitle,
        content,
        coverImage: coverImage.trim() || null,
        published,
        isFeatured,
      };

      if (categoryId === "OTHER") {
        payload.newCategoryName = customCategoryName.trim();
      } else if (categoryId) {
        payload.categoryId = categoryId;
      } else {
        payload.categoryId = null;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Create New Article
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Draft or publish a rich multimedia article on Blogify.
          </p>
        </div>

        <button
          type="button"
          id="open-ai-generator-btn"
          data-testid="open-ai-generator-btn"
          onClick={() => {
            setAiModalMode("generate");
            setIsAiModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#5B48EE] to-[#7B68EE] hover:opacity-95 shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Write with AI</span>
        </button>
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
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (e.target.value !== "OTHER") {
                  setCustomCategoryName("");
                }
              }}
              className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
            >
              <option value="">Select Category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="OTHER" className="font-semibold text-[#5B48EE]">
                + Add Other / New Category...
              </option>
            </select>

            {/* Custom Category Inline Input */}
            {categoryId === "OTHER" && (
              <div className="pt-2 space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  New Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="post-custom-category-input"
                  data-testid="post-custom-category-input"
                  type="text"
                  placeholder="e.g., DevOps & Cloud Architecture"
                  value={customCategoryName}
                  onChange={(e) => {
                    setCustomCategoryName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="w-full text-xs sm:text-sm rounded-xl border border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 px-3.5 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  This new category will be created and added to the platform filters automatically.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="open-ai-image-modal-btn"
                  data-testid="open-ai-image-modal-btn"
                  onClick={() => setIsAiImageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/50 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/60 border border-fuchsia-200 dark:border-fuchsia-800/60 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Generate Cover with AI</span>
                </button>
                {coverImage && (
                  <button
                    type="button"
                    id="cover-image-remove-btn"
                    data-testid="cover-image-remove-btn"
                    onClick={() => setCoverImage("")}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Preview */}
            {coverImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="cover-image-preview"
                  data-testid="cover-image-preview"
                  src={coverImage}
                  alt="Article Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageUploadDropzone
                  testIdPrefix="cover-image"
                  compact
                  onUploadSuccess={(url) => {
                    setCoverImage(url);
                  }}
                />
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
                  <span className="bg-white dark:bg-gray-950 px-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Or Enter URL
                  </span>
                  <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
                </div>
                <input
                  id="post-cover-image-input"
                  data-testid="post-cover-image-input"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Article Content <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              id="open-ai-content-btn"
              data-testid="open-ai-content-btn"
              onClick={() => {
                setAiModalMode("generate");
                setIsAiModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5B48EE] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Content with AI</span>
            </button>
          </div>
          <RichTextEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (errorMessage) setErrorMessage("");
            }}
            onOpenAiAssistant={() => {
              setAiModalMode("improve");
              setIsAiModalOpen(true);
            }}
          />
        </div>

        {/* AI Writing Assistant Modal */}
        <AiWritingModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          initialMode={aiModalMode}
          currentTitle={title}
          currentContent={content}
          onApplyDraft={(draft) => {
            if (draft.title) setTitle(draft.title);
            if (draft.excerpt) setExcerpt(draft.excerpt);
            if (draft.content) setContent(draft.content);
            if (errorMessage) setErrorMessage("");
          }}
          onApplyImprovement={(improved) => {
            setContent(improved);
            if (errorMessage) setErrorMessage("");
          }}
        />

        {/* AI Cover Image Studio Modal */}
        <AiImageModal
          isOpen={isAiImageModalOpen}
          onClose={() => setIsAiImageModalOpen(false)}
          currentTitle={title}
          currentCategory={
            categories.find((c) => c.id === categoryId)?.name || customCategoryName
          }
          currentExcerpt={excerpt}
          onApplyImage={(url) => {
            setCoverImage(url);
            if (errorMessage) setErrorMessage("");
          }}
        />

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
