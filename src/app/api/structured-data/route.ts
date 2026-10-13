// import { streamObject } from "ai";
import { generateText, Output } from 'ai';
import { openai } from "@ai-sdk/openai";
import { recipeSchema } from "./schema";
export async function POST(request: Request) {
    try {
        const { dish } = await request.json();
        // const result = streamObject({
        //     model: openai('gpt-4.1-nano'),
        //     prompt: `Generate a recipe for ${dish}`,
        //     schema: recipeSchema,
        //     schemaName: "recipe",
        //     schemaDescription: "A recipe with ingredients and steps",
        //     onFinish: ({ object, error }) => {
        //         if (error) {
        //             console.error("Streaming error:", error);
        //         } else {
        //             console.log("Recipe generated:", object);
        //         }
        //     }
        // })
        // return result.toTextStreamResponse();
        const result = await generateText({
            model: openai('gpt-4.1-nano'), // must be a reasoning model
            prompt: `Generate a recipe for ${dish}.`,
            output: Output.object({
                schema: recipeSchema,
            })
        });
        return new Response(JSON.stringify(result.output), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error generating recipe:", error);
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    }


}

