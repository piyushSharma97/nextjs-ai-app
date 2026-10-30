/**
 * API Route Handler: AI Image Generation
 * Endpoint: POST /api/generate-image
 * 
 * Concepts Demonstrated:
 * 1. `generateImage` API (Vercel AI SDK Core):
 *    - Unified abstraction for generating images across providers (OpenAI DALL-E, etc.).
 *    - Accepts text prompts and returns standardized image buffers or base64 data.
 * 2. Model Selection:
 *    - `openai.image(...)`: Specifies the OpenAI image generation model.
 * 3. Generation Parameters:
 *    - `prompt`: Textual description guiding the diffusion/image synthesis model.
 *    - `size`: Desired dimensions (e.g. "1024x1024", "1792x1024").
 *    - `providerOptions`: Model-provider-specific flags (e.g. OpenAI image quality, style).
 * 4. Data Transfer via Base64:
 *    - Returning `image.base64` and `image.mediaType` allows the client to render
 *      the image immediately as an inline Data URL (`data:image/png;base64,...`)
 *      without needing intermediate cloud blob storage (like S3 or Vercel Blob).
 * 5. Input Validation & Defense:
 *    - Validates JSON format and non-empty prompt strings before dispatching expensive diffusion requests.
 * 6. Rate Limiting Protection (`withRateLimit`):
 *    - Image generation models carry high per-request costs; strict per-IP rate limiting
 *      guarantees fair usage and guards against automated scraping.
 */

import { openai } from "@ai-sdk/openai";
import { generateImage } from 'ai';
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Validates prompt input and executes image generation.
 */
async function handlePost(req: Request) {
  // 1. Defensively parse JSON request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  // 2. Validate presence and type of the 'prompt' field
  const prompt =
    typeof body === "object" && body !== null && "prompt" in body
      ? body.prompt
      : undefined;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json(
      { error: "A non-empty prompt is required" },
      { status: 400 }
    );
  }

  try {
    // 3. Request image generation from the model provider
    const { image } = await generateImage({
      model: openai.image("gpt-image-1.5"),
      prompt: prompt.trim(),
      size: "1024x1024",
      providerOptions: {
        openai: {
          quality: "high", // High quality rendering (or 'standard' for faster/cheaper runs)
        },
      },
    });

    // 4. Return base64 payload and MIME type to the frontend
    return Response.json({
      image: image.base64,       // Raw base64 string
      mimeType: image.mediaType, // e.g. "image/png"
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

/**
 * Next.js Route Handler for HTTP POST requests.
 * Intercepted by `withRateLimit` to protect expensive diffusion resources.
 */
export function POST(request: Request) {
  return withRateLimit(request, "generate-image", () => handlePost(request));
}
