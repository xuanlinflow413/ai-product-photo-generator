"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface UploadAreaProps {
  onImageSelect: (image: string | null) => void;
}

export default function UploadArea({ onImageSelect }: UploadAreaProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
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

  const clearPreview = useCallback(() => {
    setPreview(null);
    onImageSelect(null);
  }, [onImageSelect]);

  if (preview) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <img
          src={preview}
          alt="Product preview"
          className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
        />
        <button
          onClick={clearPreview}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`w-full max-w-md mx-auto border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 bg-white"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            {isDragging ? (
              <ImageIcon className="h-8 w-8 text-blue-600" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragging ? "Drop your image here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}
