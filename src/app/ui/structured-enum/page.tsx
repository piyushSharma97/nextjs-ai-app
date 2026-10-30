/**
 * Client Page Component: Structured Enum / Sentiment Classification UI
 * Route: /ui/structured-enum
 * 
 * Concepts Demonstrated:
 * 1. Consuming Strict Categorical Enums:
 *    - Because `/api/structured-enum` enforces `output: "enum"`, the response
 *      is guaranteed to be exactly `"positive" | "negative" | "neutral"`.
 *    - In the UI, conditional rendering (`result === "positive"`) is 100% reliable
 *      because the LLM cannot return unexpected strings like `"It is positive"`,
 *      backticks, markdown, or trailing spaces.
 * 2. Visual State Mapping:
 *    - Maps each enumerated category directly to an expressive UI badge / emoji.
 * 3. Form Handling:
 *    - Stores input before clearing, sends JSON payload via `fetch`, and manages loading/error states.
 */

"use client";

import { useState } from "react";

export default function StructuredEnumPage() {
  // State 1: User's input sentence or review to analyze
  const [text, setText] = useState("");

  // State 2: Returned sentiment enum ("positive" | "negative" | "neutral" | null)
  const [result, setResult] = useState<string | null>(null);

  // State 3: Loading indicator while the AI analyzes the text
  const [isLoading, setIsLoading] = useState(false);

  // State 4: Any error encountered during the fetch
  const [error, setError] = useState<string | null>(null);

  /**
   * Sends the user's text to the sentiment classification endpoint.
   */
  const analyzeSentiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    // Capture text locally before resetting input field
    const textToAnalyze = text.trim();
    setIsLoading(true);
    setError(null);
    setText("");
    setResult(null);

    try {
      // POST the text to our structured enum endpoint
      const response = await fetch("/api/structured-enum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze sentiment");
      }

      // The returned value is guaranteed to match one of our enum literals
      setResult(data);
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
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
      <h1 className="text-xl font-bold mb-1">🏷️ Structured Enum Classification</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter a customer review, tweet, or message to classify its sentiment.
      </p>

      {/* Error Banner */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="text-zinc-400 animate-pulse mb-4">
          Analyzing sentiment...
        </div>
      )}

      {/* Classification Result Presentation */}
      {result && (
        <div className="mb-6 p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-mono">
            Detected Sentiment
          </p>
          <div className="text-3xl font-bold">
            {result === "positive" && (
              <span className="text-green-400">😊 Positive</span>
            )}
            {result === "negative" && (
              <span className="text-red-400">😞 Negative</span>
            )}
            {result === "neutral" && (
              <span className="text-yellow-400">😐 Neutral</span>
            )}
          </div>
        </div>
      )}

      {/* Floating Prompt Bar */}
      <form
        onSubmit={analyzeSentiment}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. This product exceeded all my expectations!"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !text.trim()}
          >
            Analyze
          </button>
        </div>
      </form>
    </div>
  );
}
