import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  try{
    const { prompt } = await request.json();

    const result =  streamText({
      model: openai('gpt-4.1-nano'),
      prompt,
      temperature: 0.2
    });
    console.log("Streaming text response initiated.",result);
    result.usage.then(usage => {
      console.log("Token usage:", usage);
       console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });
    return result.toUIMessageStreamResponse();

  }catch (error) {
    console.error("Error streaming text:", error);
    return Response.json({ error: "Failed to stream text" }, { status: 500 });
  }
}