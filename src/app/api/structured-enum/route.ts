/**
 * API Route Handler: Structured Enum & Classification
 * Endpoint: POST /api/structured-enum
 * 
 * Concepts Demonstrated:
 * 1. Categorical Classification with `output: "enum"`:
 *    - In addition to complex objects, `generateObject` can constrain LLM output
 *      to a strict enumerated list of strings (e.g. `["positive", "negative", "neutral"]`).
 *    - Guarantees the output is strictly one of the allowed options with zero hallucination,
 *      no extraneous commentary, and no Markdown wrapping.
 * 2. Use Cases:
 *    - Sentiment analysis, ticket routing, intent detection, content moderation,
 *      and multi-way decision trees.
 * 3. Helper Method `result.toJsonResponse()`:
 *    - Automatically creates a Web API `Response` instance with correct `Content-Type: application/json`
 *      headers and the serialized enum value.
 * 4. Rate Limiting Protection (`withRateLimit`):
 *    - Protects the classification endpoint with Upstash Redis rate limits.
 */

import { generateObject } from 'ai';
import { textModel } from "../../../lib/ai-model";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Executes categorical sentiment classification.
 */
async function handlePost(req: Request) {
  try {
    // 1. Extract the text snippet to classify
    const { text } = await req.json();

    // 2. Classify text strictly into one of the three enumerated options
    const result = await generateObject({
      model: textModel,
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt: `Classify the sentiment in this text: "${text}"`,
    });

    // 3. Return the JSON response directly using the built-in helper
    return result.toJsonResponse();
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return new Response("Failed to generate sentiment", { status: 500 });
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Wrapped with withRateLimit to prevent classification spam.
 */
export function POST(request: Request) {
  return withRateLimit(request, "structured-enum", () => handlePost(request));
}
