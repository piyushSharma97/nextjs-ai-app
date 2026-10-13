import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
export async function POST(request: Request) {

    try {
        const { messages }: { messages: UIMessage[] } = await request.json(); // consume the request body to avoid issues with streaming
        const result = streamText({
            model: openai('gpt-4.1-nano'),
            messages: [{
                role: "system",
                content:
                    "You are a helpful coding assistant. Keep responses under 3 sentences and focus on practical examples.",
            }, ... await convertToModelMessages(messages)],
        });
        result.usage.then(usage => {
            console.log("Token usage:", usage);
        })
        result.usage.then((usage) => {
            console.log({
                messageCount: messages.length,
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.totalTokens,
            });
        });
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error in chat route:", error);
        return Response.json({ error: "Failed to process chat" }, { status: 500 });
    }
}