"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  if (!editor) return null;

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: formattedUrl, target: "_blank", rel: "noopener noreferrer" })
        .run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const handleSetImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || "Article image" }).run();
    }
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
  };

  return (
    <div
      id="editor-toolbar"
      role="toolbar"
      aria-label="Formatting options"
      className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/90 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl text-gray-700 dark:text-gray-300"
    >
      {/* Headings */}
      <button
        type="button"
        id="toolbar-h1-btn"
        aria-label="Heading 1"
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        H1
      </button>

      <button
        type="button"
        id="toolbar-h2-btn"
        aria-label="Heading 2"
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        H2
      </button>

      <button
        type="button"
        id="toolbar-h3-btn"
        aria-label="Heading 3"
        title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        H3
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

      {/* Inline Formatting */}
      <button
        type="button"
        id="toolbar-bold-btn"
        aria-label="Bold"
        title="Bold (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("bold")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h8a4 4 0 100-8H6v8zm0 0h9a4 4 0 110 8H6v-8z" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-italic-btn"
        aria-label="Italic"
        title="Italic (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("italic")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 0h-6m2 16h-6" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-strike-btn"
        aria-label="Strikethrough"
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
          editor.isActive("strike")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 15L15 9m-9 3h12" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-inline-code-btn"
        aria-label="Inline Code"
        title="Inline Code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
          editor.isActive("code")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        &lt;/&gt;
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

      {/* Lists & Quotes */}
      <button
        type="button"
        id="toolbar-bullet-list-btn"
        aria-label="Bullet List"
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors ${
          editor.isActive("bulletList")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M2 6h.01M2 12h.01M2 18h.01" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-ordered-list-btn"
        aria-label="Numbered List"
        title="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
          editor.isActive("orderedList")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        1. 2.
      </button>

      <button
        type="button"
        id="toolbar-blockquote-btn"
        aria-label="Blockquote"
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors ${
          editor.isActive("blockquote")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-codeblock-btn"
        aria-label="Code Block"
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
          editor.isActive("codeBlock")
            ? "bg-[#5B48EE] text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        {`{ }`}
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

      {/* Embeds: Link & Image */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-link-btn"
          aria-label="Insert Link"
          title="Insert Link"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href || "";
            setLinkUrl(previousUrl);
            setShowLinkModal(!showLinkModal);
          }}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("link")
              ? "bg-[#5B48EE] text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {showLinkModal && (
          <div
            id="toolbar-link-popover"
            className="absolute z-20 left-0 top-10 w-72 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl space-y-2"
          >
            <div className="space-y-2">
              <label htmlFor="toolbar-link-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Link URL
              </label>
              <input
                type="url"
                id="toolbar-link-input"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="toolbar-link-save-btn"
                  onClick={handleSetLink}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#5B48EE] hover:bg-[#4936E3] rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          id="toolbar-image-btn"
          aria-label="Insert Image"
          title="Insert Image"
          onClick={() => setShowImageModal(!showImageModal)}
          className="p-1.5 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {showImageModal && (
          <div
            id="toolbar-image-popover"
            className="absolute z-20 left-0 top-10 w-80 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl space-y-2"
          >
            <div className="space-y-2">
              <label htmlFor="toolbar-image-url-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Image Web URL
              </label>
              <input
                type="url"
                id="toolbar-image-url-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetImage();
                  }
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
                autoFocus
              />
              <input
                type="text"
                id="toolbar-image-alt-input"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetImage();
                  }
                }}
                placeholder="Alt description (optional)"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="toolbar-image-save-btn"
                  onClick={handleSetImage}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#5B48EE] hover:bg-[#4936E3] rounded-lg"
                >
                  Embed Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo & Redo */}
      <button
        type="button"
        id="toolbar-undo-btn"
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4" />
        </svg>
      </button>

      <button
        type="button"
        id="toolbar-redo-btn"
        aria-label="Redo"
        title="Redo (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
    </div>
  );
};
