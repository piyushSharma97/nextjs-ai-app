/**
 * Client Page Component: AI Image Generation UI
 * Route: /ui/generate-image
 * 
 * Concepts Demonstrated:
 * 1. Text-to-Image Generation Workflow:
 *    - Captures a descriptive user prompt and posts it to `/api/generate-image`.
 *    - Unlike text streaming, diffusion models take several seconds (5–15s) to generate
 *      a full image before returning the entire result payload at once.
 * 2. Data URL Image Rendering:
 *    - The API responds with `{ image: base64String, mimeType: "image/png" }`.
 *    - Constructing a Data URL (`data:${mimeType};base64,${base64String}`) enables
 *      instant rendering in `<Image />` without needing intermediate cloud bucket storage.
 * 3. Loading Skeleton UX:
 *    - Uses Tailwind's `aspect-square` and `animate-pulse` to create a placeholder skeleton,
 *      preventing Cumulative Layout Shift (CLS) when the generated image finishes rendering.
 */

"use client";

import Image from "next/image";
import { useState } from "react";

export default function GenerateImagePage() {
  // State 1: User's image prompt input
  const [prompt, setPrompt] = useState("");

  // State 2: Generated image data URL (`data:image/png;base64,...`)
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // State 3: Active generation loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // State 4: Any error returned by the generation API
  const [error, setError] = useState<string | null>(null);

  /**
   * Dispatches the image prompt to the backend route handler.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Capture the prompt and initialize loading state
    const currentPrompt = prompt.trim();
    setIsLoading(true);
    setImageSrc(null);
    setError(null);
    setPrompt("");

    try {
      // POST the prompt to the backend image generation route
      const response = await fetch('/api/generate-image', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Convert returned base64 into a browser-renderable Data URL
      setImageSrc(`data:${data.mimeType};base64,${data.image}`);
    } catch (err) {
      console.error("Error generating image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-xl font-bold mb-4">🎨 AI Image Generator</h1>

      {/* Error Banner */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Image Preview Canvas */}
      <div className="relative w-full aspect-square mb-20 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
        {isLoading ? (
          // Pulsing skeleton placeholder while diffusion model generates image
          <div className="w-full h-full animate-pulse bg-zinc-800 flex items-center justify-center">
            <span className="text-sm text-zinc-500">Generating image...</span>
          </div>
        ) : imageSrc ? (
          // Render the generated image
          <Image
            alt="Generated AI artwork"
            className="w-full h-full object-cover rounded-lg shadow-lg"
            src={imageSrc}
            width={1024}
            height={1024}
            unoptimized // Base64 data URLs do not need Next.js image optimization
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
            Enter a prompt below to create an image
          </div>
        )}
      </div>

      {/* Floating Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="Describe the image you want to generate..."
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
