"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = useCallback(() => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onImageSelect]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        1. Upload your product photo
      </h3>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Upload className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900">
            Click or drag image here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPG up to 10MB. Preview only — nothing is uploaded.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
          <button
            onClick={clear}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
            <img
              src={preview}
              alt="Product preview"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">
            <ImageIcon className="mr-1 inline h-3 w-3" />
            Local preview only — not uploaded to any server
          </p>
        </div>
      )}
    </div>
  );
}
