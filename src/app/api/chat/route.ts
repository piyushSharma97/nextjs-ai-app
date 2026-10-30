/**
 * API Route Handler: Multi-Turn Streaming Chat
 * Endpoint: POST /api/chat
 * 
 * Concepts Demonstrated:
 * 1. Conversational Chat Architecture:
 *    - Unlike single-prompt completions, chat models require the entire conversation
 *      history on each turn to maintain context and continuity.
 * 2. `UIMessage` vs `ModelMessage` (`convertToModelMessages`):
 *    - `UIMessage`: High-level message format used by `@ai-sdk/react` (`useChat`),
 *      which can include text parts, tool invocations, files, attachments, and annotations.
 *    - `convertToModelMessages`: Utility that translates `UIMessage[]` into standard
 *      LLM provider messages (`role: "user" | "assistant" | "system"`).
 * 3. System Prompt Ingestion:
 *    - Prepends a `system` instruction at the start of the message array to shape
 *      the AI's personality, tone, constraints, and brevity.
 * 4. Token Accumulation in Multi-Turn Chats:
 *    - With each turn, all previous messages are resent to the model.
 *    - The token telemetry logging shows how `inputTokens` grows as conversation length increases.
 * 5. Rate Limiting Middleware (`withRateLimit`):
 *    - Mitigates multi-turn chat abuse by bounding requests per IP within rolling daily windows.
 */

import { streamText, UIMessage, convertToModelMessages } from "ai";
import { textModel } from "../../../lib/ai-model";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Handles incoming chat message exchanges.
 */
async function handlePost(request: Request) {
  try {
    // 1. Parse the incoming conversation history (sent automatically by useChat)
    const { messages }: { messages: UIMessage[] } = await request.json();

    // 2. Call streamText with a system prompt followed by converted user/assistant history
    const result = streamText({
      model: textModel,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful coding assistant. Keep responses under 3 sentences and focus on practical examples.",
        },
        // Convert client-side UI message parts into provider-compatible message formats
        ...(await convertToModelMessages(messages)),
      ],
    });

    // 3. Telemetry: Log token consumption and message count
    result.usage.then((usage) => {
      console.log("Token usage:", usage);
      console.log({
        messageCount: messages.length,    // How many messages were in history
        inputTokens: usage.inputTokens,   // Total tokens in prompt + full chat history
        outputTokens: usage.outputTokens, // Tokens generated in this response
        totalTokens: usage.totalTokens,   // Cumulative cost metric
      });
    });

    // 4. Return the stream in AI SDK UI message protocol format
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return Response.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Uses withRateLimit higher-order wrapper to enforce API quotas.
 */
export function POST(request: Request) {
  return withRateLimit(request, "chat", () => handlePost(request));
}
