"use client";

import { Download, RefreshCw } from "lucide-react";

// Mock result images from Unsplash - high quality product/ecommerce photos
const mockResults = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    alt: "Professional product photo - white background",
    label: "Clean White",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    alt: "Lifestyle product photo on table",
    label: "Lifestyle Table",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    alt: "Product in use - hand holding",
    label: "In Hand",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    alt: "Luxury minimalist product photo",
    label: "Luxury Minimal",
  },
];

export default function ResultGallery() {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Generated Product Photos
        </h3>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockResults.map((result) => (
          <div
            key={result.id}
            className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
          >
            <img
              src={result.src}
              alt={result.alt}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium">{result.label}</p>
            </div>
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100">
              <Download className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        These are demo results. In the full version, your uploaded product will appear in each scene.
      </p>
    </div>
  );
}
