"use client";

import { Loader2 } from "lucide-react";

export default function LoadingProgress() {
  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        <span className="text-sm font-medium text-gray-700">
          Generating your product photos...
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-progress" />
      </div>
      <p className="text-xs text-gray-500 text-center mt-3">
        This may take 15-30 seconds
      </p>
    </div>
  );
}
