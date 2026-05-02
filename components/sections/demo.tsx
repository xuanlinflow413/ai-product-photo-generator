"use client";

import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import { SceneSelector } from "./scene-selector";
import { Generator } from "./generator";

export function Demo() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  return (
    <section id="demo" className="bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Try the Demo
          </h2>
          <p className="mt-2 text-slate-600">
            Upload a product photo, pick a scene, and preview the AI generation flow.
          </p>
          <p className="mt-1 text-sm text-amber-600">
            Note: This is a UI demo. No real AI generation is connected yet.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-8">
            <ImageUploader onImageSelect={setImageFile} />
            <SceneSelector
              selected={selectedScene}
              onSelect={setSelectedScene}
            />
            <Generator
              hasImage={!!imageFile}
              selectedScene={selectedScene}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
