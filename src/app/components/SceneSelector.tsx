"use client";

import { Check, Sparkles, Home, Hand, TreePine, Gem, PartyPopper } from "lucide-react";

interface Scene {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const scenes: Scene[] = [
  {
    id: "clean-white",
    title: "Clean White Background",
    description: "Classic look for Amazon, Etsy, and Shopify listings",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "lifestyle-table",
    title: "Lifestyle on Table",
    description: "Natural setting on wood, marble, or fabric surfaces",
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: "in-hand",
    title: "In Hand / Being Used",
    description: "Show your product in action with a hand model",
    icon: <Hand className="h-5 w-5" />,
  },
  {
    id: "nature",
    title: "Nature / Outdoor",
    description: "Garden, beach, or urban settings for lifestyle brands",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    id: "luxury",
    title: "Luxury Minimalist",
    description: "Premium dark or neutral tones for high-end products",
    icon: <Gem className="h-5 w-5" />,
  },
  {
    id: "holiday",
    title: "Holiday / Seasonal",
    description: "Festive backgrounds for seasonal promotions",
    icon: <PartyPopper className="h-5 w-5" />,
  },
];

interface SceneSelectorProps {
  selectedScene: string;
  onSceneSelect: (sceneId: string) => void;
}

export default function SceneSelector({ selectedScene, onSceneSelect }: SceneSelectorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-sm font-medium text-gray-700 mb-3 text-center">
        Choose a scene for your product photo
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSceneSelect(scene.id)}
            className={`relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all ${
              selectedScene === scene.id
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {selectedScene === scene.id && (
              <div className="absolute top-2 right-2">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div
              className={`p-2 rounded-md ${
                selectedScene === scene.id ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <div className={selectedScene === scene.id ? "text-blue-600" : "text-gray-500"}>
                {scene.icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">{scene.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{scene.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
