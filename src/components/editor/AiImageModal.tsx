"use client";

import React, { useState, useEffect } from "react";

export type ImageStylePreset = "photorealistic" | "minimalist" | "cyberpunk" | "isometric" | "artistic";
export type AspectRatioOption = "16:9" | "4:3" | "1:1";

interface AiImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentCategory?: string;
  currentExcerpt?: string;
  onApplyImage: (imageUrl: string) => void;
}

export const AiImageModal: React.FC<AiImageModalProps> = ({
  isOpen,
  onClose,
  currentTitle = "",
  currentCategory = "",
  currentExcerpt = "",
  onApplyImage,
}) => {
  const [promptMode, setPromptMode] = useState<"auto" | "custom">("auto");
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState<ImageStylePreset>("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("16:9");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState<string>("");
  const [seed, setSeed] = useState(1);

  // Synchronize initial prompt mode if title exists
  useEffect(() => {
    if (isOpen) {
      if (currentTitle.trim()) {
        setPromptMode("auto");
      } else {
        setPromptMode("custom");
      }
      setErrorMessage("");
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleGenerate = async (nextSeed?: number) => {
    // Validation: if custom mode and prompt is blank, OR auto mode and title is blank
    if (promptMode === "custom" && !customPrompt.trim()) {
      setErrorMessage("Please enter a custom visual description or prompt for the image.");
      return;
    }

    if (promptMode === "auto" && !currentTitle.trim()) {
      setErrorMessage("Please provide an article title first or switch to custom prompt mode.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);

    const activeSeed = typeof nextSeed === "number" ? nextSeed : seed;

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptMode === "custom" ? customPrompt.trim() : undefined,
          blogTitle: promptMode === "auto" ? currentTitle.trim() : undefined,
          category: currentCategory.trim() || undefined,
          excerpt: currentExcerpt.trim() || undefined,
          style,
          aspectRatio,
          seed: activeSeed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImage(data.data.imageUrl);
      setPromptUsed(data.data.promptUsed);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    handleGenerate(nextSeed);
  };

  const handleApply = () => {
    if (generatedImage) {
      onApplyImage(generatedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    setGeneratedImage(null);
    setErrorMessage("");
    onClose();
  };

  return (
    <div
      id="ai-image-modal"
      data-testid="ai-image-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>AI Cover Image Studio</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-900/50">
                  GenAI Visuals
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate high-definition, bespoke banner graphics for your article.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-ai-image-modal-btn"
            data-testid="close-ai-image-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div
              id="ai-image-error-banner"
              data-testid="ai-image-error-banner"
              className="p-3.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Switcher: Auto vs Custom */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              type="button"
              id="prompt-mode-auto-btn"
              data-testid="prompt-mode-auto-btn"
              onClick={() => {
                setPromptMode("auto");
                setErrorMessage("");
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                promptMode === "auto"
                  ? "bg-white dark:bg-gray-900 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              ✨ Auto from Blog Content
            </button>
            <button
              type="button"
              id="prompt-mode-custom-btn"
              data-testid="prompt-mode-custom-btn"
              onClick={() => {
                setPromptMode("custom");
                setErrorMessage("");
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                promptMode === "custom"
                  ? "bg-white dark:bg-gray-900 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🎨 Custom Art Instructions
            </button>
          </div>

          {/* Context Details or Custom Prompt Input */}
          {promptMode === "auto" ? (
            <div className="p-4 rounded-2xl bg-fuchsia-50/40 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/40 space-y-2 text-xs">
              <span className="font-bold text-fuchsia-700 dark:text-fuchsia-300 block uppercase text-[10px] tracking-wider">
                Synthesizing Art Prompt From:
              </span>
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Title:</strong> {currentTitle || <span className="text-amber-600 italic">No title entered yet</span>}
              </p>
              {currentCategory && (
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Category:</strong> {currentCategory}
                </p>
              )}
              {currentExcerpt && (
                <p className="text-gray-500 dark:text-gray-400 text-[11px] italic truncate">
                  <strong>Excerpt:</strong> &quot;{currentExcerpt}&quot;
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Custom Visual Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ai-image-prompt-input"
                data-testid="ai-image-prompt-input"
                rows={3}
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="e.g. A futuristic glass workstation with glowing neon holographic charts overlooking a cyber city..."
                className="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          )}

          {/* Style Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Artistic Aesthetic Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "photorealistic", label: "Photorealistic Modern", desc: "Crisp studio lighting" },
                { id: "minimalist", label: "Minimalist Vector", desc: "Clean geometric flat art" },
                { id: "cyberpunk", label: "Cyberpunk Neon", desc: "Vibrant high-contrast dark mode" },
                { id: "isometric", label: "3D Isometric", desc: "Editorial clay/glass 3D" },
                { id: "artistic", label: "Abstract Expressionist", desc: "Fluid painted gradients" },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  id={`image-style-${s.id}`}
                  data-testid={`image-style-${s.id}`}
                  onClick={() => setStyle(s.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    style === s.id
                      ? "bg-fuchsia-50/70 dark:bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 shadow-xs"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Framing & Aspect Ratio
            </label>
            <div className="flex gap-2">
              {[
                { id: "16:9", label: "16:9 (Landscape Cover Banner)" },
                { id: "4:3", label: "4:3 (Editorial Standard)" },
                { id: "1:1", label: "1:1 (Square Thumbnail)" },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  id={`aspect-ratio-${r.id.replace(":", "-")}`}
                  data-testid={`aspect-ratio-${r.id.replace(":", "-")}`}
                  onClick={() => setAspectRatio(r.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    aspectRatio === r.id
                      ? "bg-fuchsia-50/70 dark:bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview Area */}
          {generatedImage && (
            <div id="ai-image-preview-card" data-testid="ai-image-preview-card" className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">
                  Generated Cover Preview
                </span>
                <button
                  type="button"
                  id="ai-image-regenerate-btn"
                  data-testid="ai-image-regenerate-btn"
                  disabled={isGenerating}
                  onClick={handleRegenerate}
                  className="text-xs font-semibold text-[#5B48EE] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Regenerate Variant</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md bg-gray-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="ai-image-preview-img"
                  data-testid="ai-image-preview-img"
                  src={generatedImage}
                  alt="AI Generated Cover Visual"
                  className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {promptUsed && (
                <p className="text-[10px] text-gray-400 italic line-clamp-2">
                  Prompt: {promptUsed}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex items-center justify-between gap-3">
          <button
            type="button"
            id="ai-image-discard-btn"
            data-testid="ai-image-discard-btn"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!generatedImage ? (
              <button
                type="button"
                id="ai-image-generate-btn"
                data-testid="ai-image-generate-btn"
                disabled={isGenerating}
                onClick={() => handleGenerate()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:opacity-95 transition-all shadow-md hover:shadow-fuchsia-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating Image...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Generate Cover Image</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                id="ai-image-apply-btn"
                data-testid="ai-image-apply-btn"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Apply as Cover Image</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
