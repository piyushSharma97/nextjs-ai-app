/**
 * Schema Definition: Structured Recipe Object
 * 
 * Concepts Demonstrated:
 * 1. Zod for Structured LLM Outputs:
 *    - By defining a schema with Zod, the Vercel AI SDK automatically converts it
 *      into a JSON Schema that is supplied to OpenAI's Structured Outputs feature
 *      (constrained decoding / grammar-guided generation).
 *    - This guarantees 100% schema adherence: the model will NEVER return malformed JSON
 *      or missing required fields.
 * 2. Nested Data Modeling:
 *    - Shows how to declare nested objects and arrays of objects (e.g. `ingredients: [{ name, amount }]`).
 * 3. Type Inference:
 *    - `z.infer<typeof recipeSchema>` generates automatic TypeScript types matching
 *      the schema, preventing duplication between types and validation logic.
 */

import { z } from "zod";

// Define the exact shape expected for a recipe
export const recipeSchema = z.object({
  recipe: z.object({
    name: z.string().describe("The official or popular name of the dish"),
    ingredients: z.array(
      z.object({
        name: z.string().describe("Name of the ingredient"),
        amount: z.string().describe("Quantity and unit (e.g. '2 cups', '200g')"),
      })
    ).describe("List of all required ingredients and measurements"),
    steps: z.array(z.string()).describe("Sequential numbered preparation instructions"),
  }),
});

// Infer TypeScript type directly from the Zod schema
export type RecipeOutput = z.infer<typeof recipeSchema>;
