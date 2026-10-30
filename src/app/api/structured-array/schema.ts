/**
 * Schema Definition: Structured Array of Pokémon
 * 
 * Concepts Demonstrated:
 * 1. Element Schema (`pokemonSchema`):
 *    - Defines the structure of an individual record/item in the array.
 *    - Used by the server's `Output.array({ element: pokemonSchema })` to instruct the
 *      AI on what each array member must look like.
 * 2. Root Array Schema (`pokemonUISchema`):
 *    - Defines the top-level collection: `z.array(pokemonSchema)`.
 *    - Used by the client-side `useObject` hook so TypeScript and the hook know
 *      that the resulting object is an array of items (`Pokemon[]`) rather than an object.
 */

import { z } from "zod";

// Schema for an individual Pokémon item
export const pokemonSchema = z.object({
  name: z.string().describe("The name of the Pokémon"),
  abilities: z.array(z.string()).describe("List of signature abilities/moves"),
});

// Schema representing an array/collection of Pokémon
export const pokemonUISchema = z.array(pokemonSchema);

// Inferred TypeScript types for backend and UI components
export type Pokemon = z.infer<typeof pokemonSchema>;
export type PokemonList = z.infer<typeof pokemonUISchema>;
