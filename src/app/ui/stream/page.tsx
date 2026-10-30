/**
 * Client Page Component: Streaming Text Completion UI
 * Route: /ui/stream
 * 
 * Concepts Demonstrated:
 * 1. `useCompletion` Hook (@ai-sdk/react):
 *    - Purpose-built React hook for streaming single-turn completions.
 *    - Automatically handles the complex logic of:
 *      - Reading HTTP Server-Sent Events / chunked streams
 *      - Progressively appending incoming tokens to `completion`
 *      - Managing controlled input state (`input`, `setInput`, `handleInputChange`)
 *      - Managing request lifecycle states (`isLoading`, `error`)
 * 2. Real-time Abort Capability (`stop()`):
 *    - The `stop` function cancels the in-flight HTTP stream immediately via an internal
 *      `AbortController`, saving LLM token costs and letting the user cancel long generations.
 * 3. Difference Between `useCompletion` and `useChat`:
 *    - `useCompletion`: Best for single prompts (summaries, rewrites, autocompletions).
 *    - `useChat`: Best for ongoing multi-turn conversations preserving history.
 */

"use client";

import { useCompletion } from "@ai-sdk/react";

export default function StreamPage() {
  // Destructure reactive state and action handlers from useCompletion
  const {
    completion,        // Progressively updated text as tokens arrive
    input,             // Current value of the input field
    handleInputChange, // Pre-wired onChange handler for <input>
    handleSubmit,      // Pre-wired onSubmit handler that triggers the stream
    isLoading,         // True while the response is streaming
    error,             // Error object if the stream fails
    stop,              // Function to immediately abort the streaming response
    setInput,          // Direct setter to reset or modify input text
  } = useCompletion({
    api: "/api/stream", // Target API endpoint on the Next.js server
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* Error notification */}
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {/* Initial loading state before first token arrives */}
      {isLoading && !completion && <div className="text-gray-400">Connecting to stream...</div>}

      {/* Streamed text: updates smoothly as each chunk arrives */}
      {completion && (
        <div className="whitespace-pre-wrap bg-zinc-900 text-zinc-100 p-4 rounded-lg border border-zinc-800">
          {completion}
        </div>
      )}

      {/* Floating control bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setInput(""); // Clear input field upon sending
          handleSubmit(e);
        }}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            value={input}
            onChange={handleInputChange}
            placeholder="How can I help you?"
          />

          {/* Conditional Button: Shows 'Stop' while streaming, 'Send' when idle */}
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
