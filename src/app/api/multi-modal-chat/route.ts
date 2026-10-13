import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {

    try{
        const { messages }: { messages: UIMessage[] }  = await request.json();
        const result =  streamText({
            model: openai('gpt-4.1-nano'),
            messages:await convertToModelMessages(messages as UIMessage[]),
            temperature: 0.2
        });
        console.log("Streaming multi-modal chat response initiated.",result);
 return result.toUIMessageStreamResponse();
    }catch (error) {
        console.error("Error in multi-modal chat:", error);
        return Response.json({ error: "Failed to process multi-modal chat" }, { status: 500 });
    }
}