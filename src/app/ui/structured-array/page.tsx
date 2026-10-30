/**
 * Client Page Component: Structured Array Generation UI
 * Route: /ui/structured-array
 * 
 * Concepts Demonstrated:
 * 1. Array-Level Structured Output with `useObject`:
 *    - Uses `pokemonUISchema` (`z.array(pokemonSchema)`) as the schema target.
 *    - `object` is typed as an array of items (`Pokemon[]`), allowing direct iteration
 *      via `object?.map(...)` without needing an intermediate wrapper object.
 * 2. Progressive Array Rendering:
 *    - As each array element is generated, it immediately appears on screen.
 *    - Optional chaining on `pokemon?.abilities?.map(...)` ensures that cards render
 *      gracefully even before all nested properties have completed streaming.
 * 3. Dynamic Filtering via Prompt Payload:
 *    - User specifies an attribute (e.g. "Fire", "Water", "Electric"), which is sent
 *      to the server to guide targeted LLM synthesis.
 */

"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonUISchema } from "@/app/api/structured-array/schema";

export default function StructuredArrayPage() {
  // Input state for Pokémon element type (e.g. "Electric", "Grass", "Dragon")
  const [type, setType] = useState("");

  // Initialize useObject configured with an Array schema
  const {
    submit,    // Dispatches the { type } payload to the backend
    object,    // The generated array of Pokémon objects
    isLoading, // True during active generation
    error,     // Error details if generation fails
    stop,      // Aborts the in-flight request
  } = useObject({
    api: "/api/structured-array",
    schema: pokemonUISchema,
  });

  /**
   * Dispatches the Pokémon type to the API.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim() || isLoading) return;

    submit({ type: type.trim() });
    setType("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl pt-12 pb-24 mx-auto">
      <h1 className="text-xl font-bold mb-1">📋 Structured Array Generation</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter an elemental type (e.g. &quot;Electric&quot;, &quot;Fire&quot;, &quot;Psychic&quot;) to generate a typed list of Pokémon
      </p>

      {/* Error Banner */}
      {error && <div className="text-red-500 mb-4 px-4">{error.message}</div>}

      {/* Array Cards Grid */}
      {object && (
        <div className="space-y-6">
          {object.map((pokemon, index) => (
            <div
              key={pokemon?.name || index}
              className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-700"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">
                {pokemon?.name || "Generating Pokémon..."}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {pokemon?.abilities?.map((ability, abilityIndex) => (
                  <div
                    key={abilityIndex}
                    className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-md text-sm font-medium text-zinc-200"
                  >
                    ⚡ {ability}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-2xl mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Enter a type (e.g. Fire, Water, Ghost)..."
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !type.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
