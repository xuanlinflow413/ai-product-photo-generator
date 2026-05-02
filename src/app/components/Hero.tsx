"use client";

import { useState, useCallback } from "react";
import UploadArea from "./UploadArea";
import SceneSelector from "./SceneSelector";
import GenerateButton from "./GenerateButton";
import LoadingProgress from "./LoadingProgress";
import ResultGallery from "./ResultGallery";

export default function Hero() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState("clean-white");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setShowResults(false);

    // Mock 3-second generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);
    }, 3000);
  }, [uploadedImage]);

  return (
    <section id="upload" className="w-full py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            AI Product Photo Generator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a product photo, pick a scene, and preview AI-generated product images for your online store. See what&apos;s possible before the full version launches.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              No signup required
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Works in your browser
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Try 6 different scenes
            </span>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <UploadArea onImageSelect={setUploadedImage} />
        </div>

        {/* Scene Selector */}
        <div className="mb-8">
          <SceneSelector
            selectedScene={selectedScene}
            onSceneSelect={setSelectedScene}
          />
        </div>

        {/* Generate Button */}
        <div className="mb-8">
          <GenerateButton
            disabled={!uploadedImage || isGenerating}
            onClick={handleGenerate}
          />
        </div>

        {/* Loading / Results */}
        {isGenerating && <LoadingProgress />}
        {showResults && <ResultGallery />}
      </div>
    </section>
  );
}
