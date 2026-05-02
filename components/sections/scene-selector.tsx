"use client";

import {
  Square,
  Coffee,
  Hand,
  TreePine,
  Gem,
  PartyPopper,
} from "lucide-react";

const scenes = [
  {
    id: "white",
    title: "Clean White Background",
    description: "Pure white backdrop with soft shadow — perfect for Amazon & Etsy main images.",
    icon: Square,
  },
  {
    id: "lifestyle",
    title: "Lifestyle on Table",
    description: "Product placed on a styled surface like marble, wood, or linen for warm context.",
    icon: Coffee,
  },
  {
    id: "inhand",
    title: "In Hand / Being Used",
    description: "Show the product in action — held, worn, or actively used by a person.",
    icon: Hand,
  },
  {
    id: "nature",
    title: "Nature / Outdoor",
    description: "Natural light, greenery, or outdoor settings — great for sports & outdoor gear.",
    icon: TreePine,
  },
  {
    id: "luxury",
    title: "Luxury Minimalist",
    description: "Muted tones, clean lines, and high-end textures for jewelry & premium products.",
    icon: Gem,
  },
  {
    id: "holiday",
    title: "Holiday / Seasonal",
    description: "Festive backgrounds for seasonal campaigns — holidays, celebrations & events.",
    icon: PartyPopper,
  },
];

interface SceneSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function SceneSelector({ selected, onSelect }: SceneSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        2. Choose a scene
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => {
          const Icon = scene.icon;
          const isSelected = selected === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isSelected ? "text-indigo-900" : "text-slate-900"
                  }`}
                >
                  {scene.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {scene.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
