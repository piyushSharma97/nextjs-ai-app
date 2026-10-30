/**
 * Client Page Component: Streaming Conversational Chat UI
 * Route: /ui/chat
 * 
 * Concepts Demonstrated:
 * 1. `useChat` Hook (@ai-sdk/react):
 *    - The flagship hook in the Vercel AI SDK for managing multi-turn chat sessions.
 *    - Automatically sends full conversational history to `/api/chat` on every submission.
 *    - Automatically streams AI responses back and appends them to `messages`.
 * 2. Status Lifecycle States (`status`):
 *    - `"ready"`: Idle and waiting for user input.
 *    - `"submitted"`: Prompt dispatched; awaiting first chunk from model.
 *    - `"streaming"`: Receiving incoming tokens in real-time.
 *    - `"error"`: Request encountered an error.
 * 3. Structured Message Parts (`msg.parts`):
 *    - In AI SDK v4+, `UIMessage` stores content as a list of `parts` (e.g. text parts,
 *      tool invocations, reasoning thoughts, attachments).
 *    - Iterating over `msg.parts` allows rendering rich multi-element messages seamlessly.
 * 4. Stop / Abort Capability (`stop`):
 *    - Lets the user cancel a long-running response mid-stream.
 */

"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  // Local state for the user's current message draft
  const [input, setInput] = useState("");

  // Destructure reactive chat state and controller functions
  const {
    messages,    // Array of all messages exchanged in the current session
    sendMessage, // Function to append user message and trigger streaming completion
    status,      // Lifecycle status: 'ready' | 'submitted' | 'streaming' | 'error'
    error,       // Captured runtime error object if API fails
    stop,        // Function to abort current in-flight stream
  } = useChat(); // Defaults to POST /api/chat

  /**
   * Handles user form submission.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    // Send the message using the parts API
    sendMessage({ text: input });
    setInput(""); // Clear draft input
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-xl font-bold mb-4">💬 Streaming Chat</h1>

      {/* Error display */}
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {/* Chat Messages List */}
      <div className="flex flex-col gap-3 mb-6">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-zinc-800 text-zinc-100"
            }`}
          >
            {/* Render each part of the message (text, reasoning, etc.) */}
            {msg.parts.map((part, partIndex) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={`${msg.id}-${partIndex}`}
                      className="whitespace-pre-wrap"
                    >
                      {part.text}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>

      {/* Loading Spinner during request dispatch or active token streaming */}
      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-xs text-zinc-400">AI is thinking...</span>
          </div>
        </div>
      )}

      {/* Floating Chat Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="How can I help you?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Render 'Stop' button during active generation; 'Send' button when ready */}
          {status === "submitted" || status === "streaming" ? (
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
              disabled={status !== "ready" || !input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
