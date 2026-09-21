"use client";

import React, { useState, useEffect } from "react";

export type AiModalMode = "generate" | "improve";

interface AiWritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AiModalMode;
  currentTitle?: string;
  currentContent?: string;
  onApplyDraft?: (data: { title: string; excerpt: string; content: string; tags: string[] }) => void;
  onApplyImprovement?: (improvedContent: string) => void;
}

export const AiWritingModal: React.FC<AiWritingModalProps> = ({
  isOpen,
  onClose,
  initialMode = "generate",
  currentTitle: _currentTitle = "",
  currentContent = "",
  onApplyDraft,
  onApplyImprovement,
}) => {
  const [mode, setMode] = useState<AiModalMode>(initialMode);

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Generation State
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<"conversational" | "professional" | "technical" | "storytelling">("conversational");
  const [generatedDraft, setGeneratedDraft] = useState<{
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
  } | null>(null);

  // Improvement State
  const [improveType, setImproveType] = useState<"polish" | "grammar" | "engaging" | "vocabulary" | "shorten">("polish");
  const [improvedContent, setImprovedContent] = useState<string | null>(null);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a topic or context description for the AI to write about.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setGeneratedDraft(null);

    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          prompt: prompt.trim(),
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate blog draft");
      }

      setGeneratedDraft(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while generating the draft.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    const rawContent = currentContent.replace(/<[^>]*>/g, "").trim();
    if (!rawContent || rawContent === "Write your article content here...") {
      setErrorMessage("Please write or paste content into the editor before requesting improvements.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setImprovedContent(null);

    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "improve",
          content: currentContent,
          type: improveType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to improve content");
      }

      setImprovedContent(data.data.improvedContent);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while polishing the content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setGeneratedDraft(null);
    setImprovedContent(null);
    setErrorMessage("");
    onClose();
  };

  const handleApplyDraft = () => {
    if (generatedDraft && onApplyDraft) {
      onApplyDraft(generatedDraft);
      onClose();
    }
  };

  const handleApplyImprovement = () => {
    if (improvedContent && onApplyImprovement) {
      onApplyImprovement(improvedContent);
      onClose();
    }
  };

  return (
    <div
      id="ai-writing-modal"
      data-testid="ai-writing-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B48EE] to-[#818CF8] text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>AI Writing Assistant</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate full drafts from prompts or refine your existing draft with one click.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-ai-modal-btn"
            data-testid="close-ai-modal-btn"
            onClick={handleDiscard}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex px-6 pt-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            type="button"
            id="ai-tab-generate"
            data-testid="ai-tab-generate"
            onClick={() => {
              setMode("generate");
              setErrorMessage("");
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              mode === "generate"
                ? "border-[#5B48EE] text-[#5B48EE] dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            ✨ Generate from Context
          </button>
          <button
            type="button"
            id="ai-tab-improve"
            data-testid="ai-tab-improve"
            onClick={() => {
              setMode("improve");
              setErrorMessage("");
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              mode === "improve"
                ? "border-[#5B48EE] text-[#5B48EE] dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            🪄 Improve Existing Content
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div
              id="ai-validation-error"
              data-testid="ai-validation-error"
              className="p-3.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: GENERATE FROM CONTEXT */}
          {mode === "generate" && (
            <div className="space-y-4">
              {!generatedDraft ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      What would you like to write about? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="ai-prompt-input"
                      data-testid="ai-prompt-input"
                      rows={4}
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="e.g., A comprehensive beginner's guide to WebSockets with Next.js and Tailwind CSS, focusing on real-time chat architecture..."
                      className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B48EE]"
                    />
                  </div>

                  {/* Tone Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Tone & Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "conversational", label: "Conversational", desc: "Friendly & engaging" },
                        { id: "professional", label: "Professional", desc: "Crisp & authoritative" },
                        { id: "technical", label: "Technical", desc: "In-depth & rigorous" },
                        { id: "storytelling", label: "Storytelling", desc: "Narrative & creative" },
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          id={`tone-option-${t.id}`}
                          data-testid={`tone-option-${t.id}`}
                          onClick={() => setTone(t.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            tone === t.id
                              ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-[#5B48EE] text-[#5B48EE] dark:text-indigo-300 shadow-xs"
                              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Generated Draft Preview */
                <div id="ai-draft-preview" data-testid="ai-draft-preview" className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#5B48EE] uppercase tracking-wider">
                        Generated Draft Preview
                      </span>
                      <span className="text-[10px] text-gray-400">Review before applying</span>
                    </div>

                    <div className="space-y-1">
                      <h3
                        id="ai-preview-title"
                        data-testid="ai-preview-title"
                        className="text-base font-bold text-gray-900 dark:text-white"
                      >
                        {generatedDraft.title}
                      </h3>
                      <p
                        id="ai-preview-excerpt"
                        data-testid="ai-preview-excerpt"
                        className="text-xs text-gray-600 dark:text-gray-300 italic"
                      >
                        {generatedDraft.excerpt}
                      </p>
                    </div>

                    <div
                      id="ai-preview-content"
                      data-testid="ai-preview-content"
                      className="text-xs text-gray-700 dark:text-gray-300 max-h-48 overflow-y-auto p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 prose dark:prose-invert prose-sm"
                      dangerouslySetInnerHTML={{ __html: generatedDraft.content }}
                    />

                    {generatedDraft.tags && generatedDraft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {generatedDraft.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPROVE EXISTING CONTENT */}
          {mode === "improve" && (
            <div className="space-y-4">
              {!improvedContent ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Choose Improvement Goal
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "polish", label: "✨ Polish & Flow", desc: "Refine rhythm & clarity" },
                        { id: "grammar", label: "📝 Fix Grammar", desc: "Correct punctuation & spelling" },
                        { id: "engaging", label: "🔥 Make Engaging", desc: "Punchier hooks & tone" },
                        { id: "vocabulary", label: "💡 Rich Vocabulary", desc: "Elevate phrasing" },
                        { id: "shorten", label: "✂️ Make Concise", desc: "Trim fluff & brevity" },
                      ].map((imp) => (
                        <button
                          type="button"
                          key={imp.id}
                          id={`improve-option-${imp.id}`}
                          data-testid={`improve-option-${imp.id}`}
                          onClick={() => setImproveType(imp.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            improveType === imp.id
                              ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-[#5B48EE] text-[#5B48EE] dark:text-indigo-300 shadow-xs"
                              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <p className="text-xs font-bold">{imp.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{imp.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Target Content Source:
                    </span>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 max-h-36 overflow-y-auto text-xs text-gray-600 dark:text-gray-400">
                      {currentContent.replace(/<[^>]*>/g, " ").slice(0, 300) || "No content currently entered"}...
                    </div>
                  </div>
                </>
              ) : (
                /* Improved Content Preview */
                <div id="ai-improve-preview" data-testid="ai-improve-preview" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5B48EE] uppercase tracking-wider">
                      Polished Content Preview
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Ready to apply</span>
                  </div>

                  <div
                    id="ai-improved-content"
                    data-testid="ai-improved-content"
                    className="text-xs text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 prose dark:prose-invert prose-sm"
                    dangerouslySetInnerHTML={{ __html: improvedContent }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex items-center justify-between gap-3">
          <button
            type="button"
            id="ai-discard-btn"
            data-testid="ai-discard-btn"
            onClick={handleDiscard}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {generatedDraft || improvedContent ? "Discard" : "Cancel"}
          </button>

          <div className="flex items-center gap-2">
            {mode === "generate" && !generatedDraft && (
              <button
                type="button"
                id="ai-generate-btn"
                data-testid="ai-generate-btn"
                disabled={isLoading}
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B48EE] to-[#7B68EE] hover:opacity-95 transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Generate Draft</span>
                  </>
                )}
              </button>
            )}

            {mode === "generate" && generatedDraft && (
              <button
                type="button"
                id="ai-apply-draft-btn"
                data-testid="ai-apply-draft-btn"
                onClick={handleApplyDraft}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Apply to Editor</span>
              </button>
            )}

            {mode === "improve" && !improvedContent && (
              <button
                type="button"
                id="ai-improve-btn"
                data-testid="ai-improve-btn"
                disabled={isLoading}
                onClick={handleImprove}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B48EE] to-[#7B68EE] hover:opacity-95 transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Polishing Text...</span>
                  </>
                ) : (
                  <>
                    <span>🪄 Improve with AI</span>
                  </>
                )}
              </button>
            )}

            {mode === "improve" && improvedContent && (
              <button
                type="button"
                id="ai-apply-improvement-btn"
                data-testid="ai-apply-improvement-btn"
                onClick={handleApplyImprovement}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Apply Changes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
