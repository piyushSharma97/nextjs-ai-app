/**
 * API Route Handler: Non-Streaming Text Completion
 * Endpoint: POST /api/completion
 * 
 * Concepts Demonstrated:
 * 1. `generateText` Function (Vercel AI SDK Core):
 *    - Executes a non-streaming single-turn LLM generation.
 *    - The function waits until the entire completion finishes before returning.
 *    - Best suited for background tasks, summarization, offline batch jobs, or when
 *      you need to validate/process the entire response on the server before sending it.
 * 2. Next.js App Router Route Handlers:
 *    - Next.js uses web standard `Request` and `Response` objects.
 *    - Exporting named functions (GET, POST, PUT, DELETE) handles incoming HTTP requests.
 * 3. Model Configuration:
 *    - `textModel`: Shared OpenAI model configuration used across API routes.
 * 4. Higher-Order Rate Limiting Middleware (`withRateLimit`):
 *    - Protects the endpoint against API token drainage and automated abuse.
 *    - Checks client IP against Upstash Redis fixed window limits before invoking `handlePost`.
 */

import { generateText } from "ai";
import { textModel } from "../../../lib/ai-model";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Core business logic for handling completion requests after passing rate limit checks.
 */
async function handlePost(request: Request) {
  try {
    // 1. Extract the user prompt from the JSON request body
    const { prompt } = await request.json();

    // 2. Call the AI model synchronously (waiting for the full response)
    const { text } = await generateText({
      model: textModel,
      prompt,
    });

    // 3. Return the completed text wrapped in a JSON response
    return Response.json({ text });
  } catch (error) {
    // 4. Handle unexpected errors gracefully and return an appropriate HTTP 500 status
    console.error("Error generating text:", error);
    return Response.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Intercepted by `withRateLimit` to enforce per-IP daily quotas.
 */
export function POST(request: Request) {
  return withRateLimit(request, "completion", () => handlePost(request));
}
