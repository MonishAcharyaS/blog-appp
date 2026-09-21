"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextEditorProps {
  value?: string;
  onChange?: (sanitizedHtml: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
  onOpenAiAssistant?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Write your masterpiece here...",
  minHeight = "280px",
  error,
  onOpenAiAssistant,
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const [, setTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#5B48EE] underline font-medium hover:text-[#4936E3]",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto my-4 border border-gray-200 dark:border-gray-800 shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id: "tiptap-content-editable",
        "data-testid": "tiptap-content-editable",
        class:
          "prose dark:prose-invert max-w-none focus:outline-none p-5 text-gray-800 dark:text-gray-100 font-sans leading-relaxed min-h-[250px]",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich Text Article Editor",
      },
    },
    onSelectionUpdate: () => {
      setTick((t) => t + 1);
    },
    onTransaction: () => {
      setTick((t) => t + 1);
    },
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const sanitized = sanitizeHtml(rawHtml);
      const text = editor.getText();

      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);

      if (onChange) {
        onChange(sanitized);
      }
    },
  });

  // Keep internal content synchronized if value changes externally (e.g. reset/clear)
  useEffect(() => {
    if (editor && value !== undefined) {
      const current = editor.getHTML();
      if (value === "" && current !== "<p></p>" && current !== "") {
        editor.commands.setContent("");
      } else if (!editor.isFocused && sanitizeHtml(current) !== sanitizeHtml(value)) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  return (
    <div
      id="rich-text-editor-container"
      data-testid="rich-text-editor-container"
      className={`rounded-2xl border transition-all bg-white dark:bg-gray-900 shadow-xs flex flex-col ${
        error
          ? "border-red-500 ring-2 ring-red-500/20"
          : "border-gray-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-[#5B48EE]/30 focus-within:border-[#5B48EE]"
      }`}
    >
      {/* Formatting Toolbar */}
      <EditorToolbar editor={editor} onOpenAiAssistant={onOpenAiAssistant} />

      {/* Editor Editable Area */}
      <div style={{ minHeight }} className="flex-1 cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Counter Bar & Validation Message */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/70 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800/80 rounded-b-2xl text-[11px] text-gray-500 dark:text-gray-400">
        <div>
          {error ? (
            <span id="editor-validation-error" className="text-red-500 font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </span>
          ) : (
            <span className="text-gray-400">Markdown and keyboard shortcuts supported</span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span id="editor-word-count">{wordCount} words</span>
          <span>•</span>
          <span id="editor-char-count">{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};
