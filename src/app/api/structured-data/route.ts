/**
 * API Route Handler: Structured Object Generation
 * Endpoint: POST /api/structured-data
 * 
 * Concepts Demonstrated:
 * 1. `generateText` with `Output.object({ schema })`:
 *    - In Vercel AI SDK (v4+), `generateText` supports typed structured outputs.
 *    - When `output: Output.object({ schema: recipeSchema })` is provided, the SDK
 *      forces the LLM to output valid JSON matching `recipeSchema` and parses `result.output`
 *      as a strictly typed TypeScript object.
 * 2. Comparing Generation Modes:
 *    - Non-streaming (`generateText` + `Output.object`):
 *      Waits for the complete JSON to be produced. Guarantees the object is fully
 *      formed and valid before sending it back.
 *    - Streaming (`streamObject`):
 *      Streams partial JSON fragments so the UI can render fields progressively.
 *      (Commented below for educational comparison).
 * 3. HTTP Response Construction:
 *    - Returns the serialized JSON object with appropriate `application/json` headers.
 * 4. Rate Limiting Protection (`withRateLimit`):
 *    - Enforces rate limiting before invoking structured JSON schema extraction.
 */

import { generateText, Output } from 'ai';
import { textModel } from "../../../lib/ai-model";
import { recipeSchema } from "./schema";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Executes structured recipe extraction from user prompts.
 */
async function handlePost(request: Request) {
  try {
    // 1. Parse the user's requested dish from JSON body
    const { dish } = await request.json();

    /* 
     * Alternative Approach: Real-Time Progressive Streaming with streamObject
     * 
     * const result = streamObject({
     *   model: textModel,
     *   prompt: `Generate a recipe for ${dish}`,
     *   schema: recipeSchema,
     *   schemaName: "recipe",
     *   schemaDescription: "A recipe with ingredients and steps",
     *   onFinish: ({ object, error }) => {
     *     if (error) console.error("Streaming error:", error);
     *     else console.log("Recipe generated:", object);
     *   }
     * });
     * return result.toTextStreamResponse();
     */

    // 2. Generate structured data using generateText + Output.object
    const result = await generateText({
      model: textModel,
      prompt: `Generate a recipe for ${dish}.`,
      output: Output.object({
        schema: recipeSchema,
      }),
    });

    // 3. Return the typed, validated object to the caller
    return new Response(JSON.stringify(result.output), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request or schema parsing failed" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Wrapped with withRateLimit to prevent schema abuse.
 */
export function POST(request: Request) {
  return withRateLimit(request, "structured-data", () => handlePost(request));
}
