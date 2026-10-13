// import { streamObject } from "ai";
import { generateText, Output } from 'ai';
import { openai } from "@ai-sdk/openai";
import { pokemonSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

    //    const result = streamObject({
    //   model: openai("gpt-5-nano"),
    //   output: "array",
    //   schema: pokemonSchema,
    //   prompt: `Generate a list of 5 ${type} type pokemon`,
    // });
    // return result.toTextStreamResponse();
    const result = await generateText({
      model: openai('gpt-4.1-nano'),
      output: Output.array({
        element: pokemonSchema,
      }),
      prompt: `Generate a list of 5 ${type} type pokemon`,
    });

    return new Response(JSON.stringify(result.output), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating pokemon:", error);
    return new Response("Failed to generate pokemon", { status: 500 });
  }
}