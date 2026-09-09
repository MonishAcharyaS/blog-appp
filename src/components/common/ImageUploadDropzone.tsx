"use client";

import React, { useState, useRef } from "react";

interface ImageUploadDropzoneProps {
  onUploadSuccess: (url: string, fileInfo?: { filename: string; originalName: string; size: number }) => void;
  onError?: (errorMessage: string) => void;
  maxSizeBytes?: number; // Defaults to 5MB
  testIdPrefix?: string;
  className?: string;
  compact?: boolean;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  onUploadSuccess,
  onError,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  testIdPrefix = "image-dropzone",
  className = "",
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = () => {
    setErrorMessage(null);
    if (onError) onError("");
  };

  const notifyError = (msg: string) => {
    setErrorMessage(msg);
    if (onError) onError(msg);
  };

  const validateFile = (file: File): boolean => {
    clearError();

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      notifyError("Only image files (JPEG, PNG, WebP, GIF) are allowed");
      return false;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      notifyError(
        `File size exceeds maximum limit of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB`
      );
      return false;
    }

    return true;
  };

  const processAndUploadFile = async (file: File) => {
    if (!validateFile(file)) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setIsUploading(true);
    clearError();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image. Please try again.");
      }

      onUploadSuccess(data.url, {
        filename: data.filename,
        originalName: data.originalName,
        size: data.size,
      });
    } catch (err: any) {
      notifyError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processAndUploadFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processAndUploadFile(file);
    }
  };

  const handleClickArea = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        id={`${testIdPrefix}-file-input`}
        data-testid={`${testIdPrefix}-file-input`}
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        id={`${testIdPrefix}-container`}
        data-testid={`${testIdPrefix}-container`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickArea}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClickArea();
          }
        }}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer select-none text-center ${
          compact ? "p-3 sm:p-4" : "p-6"
        } ${
          isDragging
            ? "border-[#5B48EE] bg-[#5B48EE]/10 dark:bg-[#5B48EE]/20 scale-[0.99]"
            : "border-gray-300 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 hover:border-[#5B48EE]/60 hover:bg-gray-100/60 dark:hover:bg-gray-800/80"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <svg
              className="animate-spin h-6 w-6 text-[#5B48EE]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span
              id={`${testIdPrefix}-uploading-text`}
              data-testid={`${testIdPrefix}-uploading-text`}
              className="text-xs font-semibold text-[#5B48EE]"
            >
              Uploading image from device...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/60 text-[#5B48EE] flex items-center justify-center">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                <span className="text-[#5B48EE] underline">Choose a file</span> or drag and drop
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                JPEG, PNG, WebP, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div
          id={`${testIdPrefix}-error`}
          data-testid={`${testIdPrefix}-error`}
          className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50 flex items-start gap-2"
        >
          <svg
            className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearError();
            }}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
