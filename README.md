# Next.js AI SDK Playground

Production AI application built with Next.js and Vercel AI SDK.

## Live Demo
https://nextjs-ai-app-pi.vercel.app

## Features
- 💬 Streaming chat with token tracking
- 🖼️ Multi-modal (text + image)
- 📊 Structured data extraction
- ✅ Completion endpoints
- 🔄 Real-time streaming UI
- TypeScript throughout

## Tech Stack
- Next.js 14 App Router
- Vercel AI SDK
- OpenAI GPT-6 Luna
- TypeScript

## API Rate Limits
All `POST /api/*` endpoints allow five requests per IP address per endpoint per
24-hour fixed window, enforced with Upstash Redis. Configure
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local` using
the REST credentials from your Upstash Redis database. An endpoint returns
`429` when its quota is exhausted and `503` if Redis is not configured or
unavailable.

## Built by
Piyush Sharma — Frontend AI Engineer — Bangalore