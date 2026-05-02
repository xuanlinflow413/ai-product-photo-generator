"use client";

import { Wand2 } from "lucide-react";

interface GenerateButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({ disabled, onClick }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-lg font-semibold transition-all ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
      }`}
    >
      <Wand2 className="h-5 w-5" />
      Generate Product Photos
    </button>
  );
}
