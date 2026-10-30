/**
 * Client Page Component: Multi-Modal Chat (Images, PDFs & Files)
 * Route: /ui/multi-modal-chat
 * 
 * Concepts Demonstrated:
 * 1. Multi-Modal Chat via `useChat`:
 *    - Passing attachments directly to `sendMessage({ text, files })`.
 *    - The AI SDK converts browser `FileList` items into data URLs or blob parts.
 * 2. Custom Transport (`DefaultChatTransport`):
 *    - By default, `useChat` targets `/api/chat`.
 *    - Using `transport: new DefaultChatTransport({ api: "/api/multi-modal-chat" })`
 *      redirects calls to our dedicated multi-modal endpoint without re-implementing logic.
 * 3. Handling Heterogeneous Message Parts:
 *    - A message can contain both text parts (`part.type === "text"`) and file parts (`part.type === "file"`).
 *    - Renders images inline using Next.js `<Image />` (`unoptimized` for local blob/data URLs).
 *    - Renders PDFs using an interactive sandboxed `<iframe>` previewer.
 * 4. Memory Management for Object URLs (`URL.createObjectURL` & `URL.revokeObjectURL`):
 *    - Demonstrates safe lifecycle management of browser blob URLs in React `useEffect` to avoid memory leaks.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";

export default function MultiModalChatPage() {
  // Input text draft state
  const [input, setInput] = useState("");

  // Reference to file input element to clear it after sending
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracks selected files before submission
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  // Initialize useChat configured with our multi-modal API endpoint
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/multi-modal-chat",
    }),
  });

  /**
   * Dispatches text and any attached files to the multi-modal endpoint.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !files?.length) || status !== "ready") return;

    // Send both text prompt and file attachments
    sendMessage({ text: input, files });

    // Reset local form and file states
    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-xl font-bold mb-4">🖼️ Multi-Modal Chat</h1>

      {/* Error alert */}
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {/* Message conversation feed */}
      {messages.map((msg) => (
        <div key={msg.id} className="mb-4">
          <div className="font-semibold text-xs text-zinc-400 mb-1">
            {msg.role === "user" ? "You:" : "AI Assistant:"}
          </div>

          {/* Render individual parts of this message */}
          {msg.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${msg.id}-${index}`}
                    className="whitespace-pre-wrap bg-zinc-900 text-zinc-100 p-3 rounded-lg"
                  >
                    {part.text}
                  </div>
                );

              case "file":
                // 1. Image Preview: Detect MIME types or common image file extensions
                if (
                  part.mediaType?.toLowerCase().startsWith("image/") ||
                  /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(part.filename ?? "")
                ) {
                  return (
                    <div key={`${msg.id}-${index}`} className="my-2">
                      <Image
                        src={part.url}
                        alt={part.filename ?? `attachment-${index}`}
                        width={500}
                        height={500}
                        unoptimized // Required when src is a local data: or blob: URL
                        className="h-auto max-w-full rounded-lg border border-zinc-700 shadow-md"
                      />
                    </div>
                  );
                }

                // 2. PDF Preview: Special preview component with embedded viewer
                if (
                  part.mediaType?.toLowerCase() === "application/pdf" ||
                  /\.pdf$/i.test(part.filename ?? "")
                ) {
                  return (
                    <PdfPreview
                      key={`${msg.id}-${index}`}
                      url={part.url}
                      title={part.filename ?? `attachment-${index}`}
                    />
                  );
                }

                // 3. Fallback: Generic downloadable attachment link
                return (
                  <a
                    key={`${msg.id}-${index}`}
                    href={part.url}
                    download={part.filename}
                    className="text-blue-500 hover:underline block my-1 text-sm"
                  >
                    📎 {part.filename ?? "Download attachment"}
                  </a>
                );

              default:
                return null;
            }
          })}
        </div>
      ))}

      {/* Streaming / Submission Spinner */}
      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-xs text-zinc-400">Analyzing attachments...</span>
          </div>
        </div>
      )}

      {/* Floating Input and Attachment Toolbar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex flex-col gap-3">
          {/* File Attachment Trigger */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {files?.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : "Attach files (Images, PDFs)"}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            />
          </div>

          {/* Text Input + Submit/Stop Button */}
          <div className="flex gap-2">
            <input
              className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your attached files..."
            />
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
                disabled={status !== "ready" || (!input.trim() && !files?.length)}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Subcomponent: Interactive PDF Previewer
 * 
 * Demonstrates:
 * - Lazy loading PDF previews only when requested by the user.
 * - Generating temporary in-memory blob URLs using `URL.createObjectURL(blob)`.
 * - Revoking blob URLs upon unmount with `URL.revokeObjectURL` to prevent memory leaks.
 */
function PdfPreview({ url, title }: { url: string; title: string }) {
  const [shouldPreview, setShouldPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [previewError, setPreviewError] = useState<string>();

  useEffect(() => {
    // Only fetch if user toggled preview
    if (!shouldPreview) return;

    let objectUrl: string | undefined;
    let cancelled = false;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the PDF preview.");
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        // Create browser-accessible blob URL for the iframe
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPreviewError(
            err instanceof Error ? err.message : "Unable to load the PDF preview."
          );
        }
      });

    // Cleanup function: safely free allocated memory when component unmounts
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [shouldPreview, url]);

  return (
    <div className="my-2 p-2 bg-zinc-800 rounded-lg">
      {!shouldPreview && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShouldPreview(true)}
            className="text-blue-400 underline text-sm"
          >
            Preview {title}
          </button>
          <a href={url} download={title} className="text-zinc-400 hover:text-white underline text-sm">
            Download PDF
          </a>
        </div>
      )}

      {previewError && <p className="text-red-500 text-sm">{previewError}</p>}

      {shouldPreview && !previewUrl && !previewError && (
        <p className="text-sm text-zinc-400" role="status">Loading PDF preview...</p>
      )}

      {previewUrl && (
        <iframe
          src={previewUrl}
          className="block w-full max-w-[500px] rounded border border-zinc-700"
          height={600}
          title={title}
        />
      )}
    </div>
  );
}
