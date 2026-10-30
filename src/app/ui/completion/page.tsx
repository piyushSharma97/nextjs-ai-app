/**
 * Client Page Component: Non-Streaming Completion UI
 * Route: /ui/completion
 * 
 * Concepts Demonstrated:
 * 1. Traditional Client-Side Data Fetching for AI:
 *    - Demonstrates how standard React hooks (`useState`) and standard `fetch()`
 *      are used to communicate with a non-streaming AI endpoint (`/api/completion`).
 *    - Contrasts with AI SDK hooks (`useCompletion` / `useChat`): here, you manually manage:
 *      - `prompt` (controlled input value)
 *      - `completion` (accumulated or final text response)
 *      - `isLoading` (request lifecycle spinner / button disable state)
 *      - `error` (network or server-side failure messages)
 * 2. Form Submission UX:
 *    - `e.preventDefault()` halts default browser submission and full-page reload.
 *    - The submit button is disabled while `isLoading` is true to prevent duplicate submissions.
 * 3. Text Formatting with `whitespace-pre-wrap`:
 *    - LLM completions often contain formatting, line breaks, and indentation.
 *    - CSS `whitespace-pre-wrap` preserves these newlines accurately in HTML.
 */

"use client";

import { useState } from "react";

export default function CompletionPage() {
  // State 1: Tracks user text input in the search/prompt bar
  const [prompt, setPrompt] = useState("");

  // State 2: Stores the final generated text returned from the server
  const [completion, setCompletion] = useState("");

  // State 3: Indicates whether an HTTP request is currently pending
  const [isLoading, setIsLoading] = useState(false);

  // State 4: Holds any error message for display to the user
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission and triggers the AI generation request.
   */
  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Reset previous state and start loading
    setIsLoading(true);
    const submittedPrompt = prompt;
    setPrompt("");
    setError(null);

    try {
      // Send the prompt to our Next.js API Route Handler
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: submittedPrompt }),
      });

      const data = await response.json();

      // Check if server returned a non-2xx status code
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Store the received completion text
      setCompletion(data.text);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      // Re-enable the submit button regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* Error Banner */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Output Display Area */}
      {isLoading ? (
        <div className="text-gray-400">Loading response...</div>
      ) : completion ? (
        <div className="whitespace-pre-wrap bg-zinc-900 text-zinc-100 p-4 rounded-lg border border-zinc-800">
          {completion}
        </div>
      ) : null}

      {/* Floating Input Bar */}
      <form
        onSubmit={complete}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="How can I help you?"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !prompt.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
