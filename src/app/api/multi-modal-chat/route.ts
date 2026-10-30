/**
 * API Route Handler: Multi-Modal Streaming Chat (Vision & File Inputs)
 * Endpoint: POST /api/multi-modal-chat
 * 
 * Concepts Demonstrated:
 * 1. Multi-Modal LLM Capabilities:
 *    - GPT-6 Luna can process text alongside images,
 *      documents, and diagrams simultaneously in the same conversation.
 * 2. Automated File/Image Conversion (`convertToModelMessages`):
 *    - In the frontend, files attached via `sendMessage({ text, files })` are represented
 *      as file/media parts inside `UIMessage`.
 *    - `convertToModelMessages` automatically transforms these parts into the model provider's
 *      expected format (e.g., OpenAI vision content parts containing `type: "image_url"`
 *      with base64 data URLs).
 *    - You do NOT need to write manual image base64 encoding or multipart extraction on the server!
 * 3. Unified Streaming Pipeline:
 *    - Despite receiving image tokens and text, streaming works identically via `streamText`
 *      and `result.toUIMessageStreamResponse()`.
 * 4. Vision Cost Protection with `withRateLimit`:
 *    - Vision tokens are significantly more expensive than plain text tokens.
 *    - Enforcing strict IP rate limiting on multi-modal endpoints is a vital cost-control measure.
 */

import { streamText, UIMessage, convertToModelMessages } from "ai";
import { textModel } from "../../../lib/ai-model";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Handles incoming multi-modal requests containing images, files, and text.
 */
async function handlePost(request: Request) {
  try {
    // 1. Extract the conversation history containing text parts and file/image parts
    const { messages }: { messages: UIMessage[] } = await request.json();

    // 2. Convert UI message parts (including attached images) into model-compatible vision parts
    const modelMessages = await convertToModelMessages(messages);

    // 3. Send to vision-capable model with streaming enabled
    const result = streamText({
      model: textModel,
      messages: modelMessages,
    });

    // 4. Return the response stream back to the useChat hook on the client
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in multi-modal chat:", error);
    return Response.json(
      { error: "Failed to process multi-modal chat" },
      { status: 500 }
    );
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Wrapped with rate limiter to protect vision inference budgets.
 */
export function POST(request: Request) {
  return withRateLimit(request, "multi-modal-chat", () => handlePost(request));
}
