/**
 * API Route Handler: Structured Array Generation
 * Endpoint: POST /api/structured-array
 * 
 * Concepts Demonstrated:
 * 1. `Output.array({ element: schema })`:
 *    - Directs the LLM to generate an array of typed elements rather than a single object.
 *    - Eliminates the need to create an artificial wrapper object like `{ items: [...] }`.
 * 2. Combining Natural Language Prompting with Schema Constraints:
 *    - Prompt requests specific count and type: `Generate a list of 5 ${type} type pokemon`.
 *    - The schema enforces that each item contains valid `name` and `abilities` fields.
 * 3. Comparing with `streamObject({ output: "array", schema })`:
 *    - The commented block shows how array streaming can be done with `streamObject`
 *      when real-time progressive array hydration is required.
 * 4. Rate Limiting Protection (`withRateLimit`):
 *    - Prevents automated exhaustion of Pokémon generation requests.
 */

import { generateText, Output } from 'ai';
import { textModel } from "../../../lib/ai-model";
import { pokemonSchema } from "./schema";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Handles Pokémon structured array requests.
 */
async function handlePost(req: Request) {
  try {
    // 1. Extract the Pokémon type filter from the client request
    const { type } = await req.json();

    /* 
     * Alternative Approach: Progressive Array Streaming with streamObject
     * 
     * const result = streamObject({
     *   model: textModel,
     *   output: "array",
     *   schema: pokemonSchema,
     *   prompt: `Generate a list of 5 ${type} type pokemon`,
     * });
     * return result.toTextStreamResponse();
     */

    // 2. Generate an array of typed objects using generateText + Output.array
    const result = await generateText({
      model: textModel,
      output: Output.array({
        element: pokemonSchema, // Schema for each element in the array
      }),
      prompt: `Generate a list of 5 ${type} type pokemon`,
    });

    // 3. Send the generated JSON array back to the client
    return new Response(JSON.stringify(result.output), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating pokemon:", error);
    return new Response("Failed to generate pokemon", { status: 500 });
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Enforces per-IP fixed window rate limits.
 */
export function POST(request: Request) {
  return withRateLimit(request, "structured-array", () => handlePost(request));
}
