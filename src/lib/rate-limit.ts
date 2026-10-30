/**
 * API Rate Limiting Utility (Upstash Redis & Fixed Window Algorithm)
 * File: src/lib/rate-limit.ts
 * 
 * Concepts Demonstrated:
 * 1. Why Rate Limiting is Essential for AI Applications:
 *    - "Denial of Wallet" Defense: LLM endpoints incur real financial costs per generated token.
 *      Without rate limits, automated bots or malicious actors could drain API credits in minutes.
 *    - Upstream Provider Quotas: Providers like OpenAI enforce strict RPM (Requests Per Minute)
 *      and TPM (Tokens Per Minute) thresholds. Rate limiting keeps traffic within safe limits.
 * 2. Serverless Redis with Upstash:
 *    - Traditional Redis requires persistent TCP connections, which fail or exhaust connections
 *      when hundreds of serverless Lambdas/Edge functions spin up concurrently.
 *    - Upstash Redis communicates over stateless HTTP/REST requests, making it ideal for
 *      Next.js App Router and serverless deployment platforms like Vercel.
 * 3. Fixed Window Rate Limiting:
 *    - `Ratelimit.fixedWindow(5, "1 d")`: Restricts each distinct client IP to 5 requests
 *      within a 24-hour window per endpoint.
 * 4. Client IP Extraction in Proxy Environments:
 *    - Reverse proxies (Vercel CDN, Cloudflare) forward client IPs via standard HTTP headers:
 *      `x-forwarded-for` (first comma-separated IP is the original client) and `x-real-ip`.
 * 5. RFC Rate Limiting Headers & Status Codes:
 *    - `429 Too Many Requests`: Standard HTTP status when client quota is exceeded.
 *    - `503 Service Unavailable`: Returned if the external Redis service is unconfigured or unreachable.
 *    - `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`: Standard headers
 *      informing API clients of their remaining budget and reset timestamp.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory cache of Ratelimit instances keyed by endpoint name (e.g. 'chat', 'stream')
// In serverless, this cache persists across warm container invocations.
const rateLimiters = new Map<string, Ratelimit>();

/**
 * Retrieves or lazily instantiates a Ratelimit instance for a specific endpoint.
 * 
 * @param endpoint - The unique identifier for the API route (e.g., 'chat', 'generate-image')
 * @returns An initialized Upstash Ratelimit instance
 */
function getRateLimiter(endpoint: string) {
  // Check if a limiter instance already exists in memory for this endpoint
  const cachedLimiter = rateLimiters.get(endpoint);
  if (cachedLimiter) return cachedLimiter;

  // Retrieve Redis REST credentials from environment variables (.env.local)
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash Redis environment variables");
  }

  // Create a new rate limiter using Upstash Redis over REST
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    // Fixed Window: 5 requests allowed per 1-day (24-hour) rolling window
    limiter: Ratelimit.fixedWindow(5, "1 d"),
    // Prefix namespaces keys in Redis so different routes don't share identical counters
    prefix: `rate-limit:api:${endpoint}`,
  });

  // Store in cache for subsequent requests handled by this serverless instance
  rateLimiters.set(endpoint, limiter);
  return limiter;
}

/**
 * Resolves the client's public IP address from incoming HTTP request headers.
 * 
 * In serverless deployments (Vercel, AWS CloudFront, Cloudflare), incoming requests
 * pass through reverse proxies. The user's actual IP is stored in header chains.
 * 
 * @param request - Standard Web API Request
 * @returns Client IP address string, or "unknown" if headers are absent
 */
function getClientIp(request: Request) {
  // x-forwarded-for format: "<client>, <proxy1>, <proxy2>"
  const forwardedIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  // Check x-real-ip first, then first IP in x-forwarded-for, or fallback to "unknown"
  return request.headers.get("x-real-ip") || forwardedIp || "unknown";
}

/**
 * Higher-Order Function / Middleware Wrapper for API Route Handlers.
 * 
 * Intercepts incoming requests, verifies IP rate limits against Upstash Redis,
 * appends standard `X-RateLimit-*` headers to the outgoing response, and returns
 * HTTP 429 when quota is exceeded or HTTP 503 if Redis is unreachable.
 * 
 * @param request - The incoming HTTP Request object
 * @param endpoint - Unique name of the endpoint being accessed (e.g. 'completion')
 * @param handler - The actual route execution callback (e.g. `() => handlePost(request)`)
 * @returns Promise resolving to a Web standard Response object
 */
export async function withRateLimit(
  request: Request,
  endpoint: string,
  handler: () => Promise<Response>
): Promise<Response> {
  let rateLimit: Awaited<ReturnType<Ratelimit["limit"]>>;

  // Step 1: Query Upstash Redis to verify and increment request counter for this IP
  try {
    const clientIp = getClientIp(request);
    rateLimit = await getRateLimiter(endpoint).limit(clientIp);
  } catch (error) {
    // If Redis is unreachable or credentials are not configured, fail closed with 503
    console.error(`Error checking ${endpoint} API rate limit:`, error);
    return Response.json(
      { error: "Rate limiting service is unavailable" },
      { status: 503 }
    );
  }

  // Step 2: Prepare standard rate limit headers to attach to the response
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimit.limit),       // Max allowed (e.g. 5)
    "X-RateLimit-Remaining": String(rateLimit.remaining), // Requests left in window
    "X-RateLimit-Reset": String(rateLimit.reset),       // Unix timestamp (ms) of window reset
  };

  // Step 3: Check if the client exceeded their limit
  if (!rateLimit.success) {
    // Calculate seconds remaining until window resets for the Retry-After header
    const retryAfter = Math.max(
      1,
      Math.ceil((rateLimit.reset - Date.now()) / 1000)
    );

    // Return 429 Too Many Requests
    return Response.json(
      { error: "Daily request limit reached. Try again after the limit resets." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": String(retryAfter), // Tell client when they can retry
        },
      }
    );
  }

  // Step 4: Quota is valid; proceed with the actual AI route handler
  const response = await handler();

  // Step 5: Merge rate limit tracking headers into the existing response headers
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(rateLimitHeaders)) {
    headers.set(name, value);
  }

  // Return the new response with preserved body, status, and enhanced headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
