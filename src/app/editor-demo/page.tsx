"use client";

import React, { useState } from "react";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

export default function EditorPublicTestPage() {
  const [content, setContent] = useState("<p>Start writing your next breakthrough blog post...</p>");
  const [error, setError] = useState("");
  const [submittedHtml, setSubmittedHtml] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate empty editor
    const stripped = content.replace(/<[^>]*>/g, "").trim();
    if (!stripped) {
      setError("Article content cannot be empty. Please write some content.");
      setSubmittedHtml("");
      return;
    }

    setError("");
    setSubmittedHtml(content);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Author Workspace & Rich-Text Editor
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compose rich articles with formatting, images, code blocks, and automatic XSS sanitization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
            Article Body
          </label>
          <RichTextEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (error) setError("");
            }}
            placeholder="Type your story, paste code, or insert images..."
            error={error}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            id="editor-submit-btn"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#5B48EE] hover:bg-[#4936E3] transition-colors shadow-xs cursor-pointer"
          >
            Publish Story
          </button>
          <button
            type="button"
            id="editor-clear-btn"
            onClick={() => {
              setContent("");
              setError("");
              setSubmittedHtml("");
            }}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Clear Editor
          </button>
        </div>
      </form>

      {/* Submitted / Live Preview Section */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Output HTML & Preview
          </h2>
          <p className="text-xs text-gray-500">
            Sanitized markup generated in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Raw Sanitized HTML Code */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sanitized HTML
            </span>
            <pre
              id="editor-raw-html-output"
              data-testid="editor-raw-html-output"
              className="p-4 rounded-xl bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto h-64 border border-gray-800"
            >
              {content}
            </pre>
          </div>

          {/* Rendered Preview Box */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Article Live Preview
            </span>
            <div
              id="editor-rendered-preview"
              data-testid="editor-rendered-preview"
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-64 overflow-y-auto prose dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        {submittedHtml && (
          <div
            id="editor-submission-success"
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Article successfully validated and published!</span>
          </div>
        )}
      </div>
    </div>
  );
}
