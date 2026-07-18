"use client";

import { useState, useCallback } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";

interface GeneratorProps {
  hasImage: boolean;
  selectedScene: string | null;
}

const mockResults = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=512&h=512&fit=crop",
    alt: "AI generated product photo variation 1",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=512&h=512&fit=crop",
    alt: "AI generated product photo variation 2",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=512&h=512&fit=crop",
    alt: "AI generated product photo variation 3",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=512&h=512&fit=crop",
    alt: "AI generated product photo variation 4",
  },
];

export function Generator({ hasImage, selectedScene }: GeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<typeof mockResults | null>(null);

  const handleGenerate = useCallback(() => {
    setLoading(true);
    setProgress(0);
    setResults(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 90);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);
      setResults(mockResults);
    }, 3000);
  }, []);

  const canGenerate = hasImage && selectedScene && !loading;

  return (
    <div className="space-y-6">
      {/* Generate button */}
      <div>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full rounded-xl py-4 text-base font-semibold transition ${
            canGenerate
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading scene previews...
            </span>
          ) : (
            "3. Preview Scene Concepts"
          )}
        </button>

        {!hasImage && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Upload a product photo to enable generation
          </p>
        )}
        {hasImage && !selectedScene && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Select a scene template to continue
          </p>
        )}
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-500">
            {progress < 30 && "Loading product preview..."}
            {progress >= 30 && progress < 60 && "Applying scene concept..."}
            {progress >= 60 && progress < 90 && "Preparing demo results..."}
            {progress >= 90 && "Finalizing preview..."}
          </p>
          <p className="text-center text-xs text-slate-400">
            Demo: Preview-only mock results
          </p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">
              Demo Results
            </h4>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Demo preview
            </span>
          </div>

          <p className="text-sm text-slate-500">
            These placeholder images only illustrate a direction. Use the live tools for marketplace exports and text changes. <span className="font-medium text-amber-700">Demo only — not for commercial use.</span>
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {results.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="aspect-square">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-white/90 p-2 opacity-0 transition group-hover:opacity-100">
                  <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 py-1.5 text-xs font-medium text-white">
                    <Download className="h-3 w-3" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reload demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
