/**
 * Home Page Component (Next.js App Router)
 * 
 * This is the landing page of the application, serving as an interactive dashboard
 * and table of contents for all the AI capabilities built using the Vercel AI SDK.
 * 
 * Concepts Demonstrated:
 * 1. Server Components (RSC):
 *    - This page has no `"use client"` directive, meaning it runs entirely on the server.
 *    - Generates static HTML with zero client-side JavaScript bundle overhead for this view.
 * 2. Navigation & Feature Indexing:
 *    - Provides direct links to dedicated UI routes demonstrating each AI SDK pattern:
 *      - Text Completion (`generateText`)
 *      - Streaming Completion (`streamText` + `useCompletion`)
 *      - Conversational Chat (`useChat` + `streamText`)
 *      - Multi-Modal Vision & Files (attaching images/PDFs to chat)
 *      - Structured Data Object Generation (`Output.object` with Zod)
 *      - Structured Array Generation (`Output.array` with Zod)
 *      - Structured Classification / Enums (`output: "enum"`)
 *      - Image Generation (`generateImage`)
 */

import Link from "next/link";

export default function Home() {
  // Collection of all AI SDK feature demos available in this project
  const features = [
    {
      emoji: '💬',
      name: 'Streaming Chat',
      href: '/ui/chat',
      desc: 'Multi-turn conversational AI with token usage tracking and auto-scrolling',
    },
    {
      emoji: '✅',
      name: 'Completion',
      href: '/ui/completion',
      desc: 'Single-turn prompt-to-text generation using OpenAI via generateText',
    },
    {
      emoji: '🔄',
      name: 'Stream',
      href: '/ui/stream',
      desc: 'Real-time word-by-word streaming responses using useCompletion hook',
    },
    {
      emoji: '🖼️',
      name: 'Multi-Modal Chat',
      href: '/ui/multi-modal-chat',
      desc: 'Conversational chat supporting file/image attachments and PDF previews',
    },
    {
      emoji: '🎨',
      name: 'Image Generation',
      href: '/ui/generate-image',
      desc: 'Generate AI imagery from text prompts using generateImage API',
    },
    {
      emoji: '📊',
      name: 'Structured Data (Object)',
      href: '/ui/structured-data',
      desc: 'Type-safe JSON object extraction (e.g. recipes) validated with Zod',
    },
    {
      emoji: '📋',
      name: 'Structured Array',
      href: '/ui/structured-array',
      desc: 'Extract lists/arrays of typed schema objects (e.g. Pokémon list)',
    },
    {
      emoji: '🏷️',
      name: 'Structured Enum',
      href: '/ui/structured-enum',
      desc: 'Strict categorical classification (positive, negative, neutral sentiment)',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
      {/* Header section */}
      <h1 className="text-4xl font-bold mb-2">
        🤖 Next.js AI SDK Playground
      </h1>
      <p className="text-gray-400 mb-8">
        Built by Piyush Sharma — Frontend AI Engineer — Bangalore
      </p>

      {/* Feature Navigation Grid */}
      <h2 className="text-2xl font-semibold mb-4">Features Built</h2>
      <div className="grid gap-3 mb-8">
        {features.map((feature) => (
          <Link
            key={feature.name}
            href={feature.href}
            className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
          >
            <span className="text-2xl">{feature.emoji}</span>
            <div>
              <p className="font-semibold">{feature.name}</p>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
            <span className="ml-auto text-gray-500 font-mono text-sm">→</span>
          </Link>
        ))}
      </div>

      {/* Technologies Used */}
      <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          'Next.js 14/15 App Router',
          'Vercel AI SDK (@ai-sdk/openai, @ai-sdk/react)',
          'OpenAI GPT-4.1-nano',
          'TypeScript',
          'Zod Schema Validation',
          'Tailwind CSS',
        ].map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 bg-white text-black rounded-full text-sm font-medium"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* GitHub Repository Link */}
      <a
        href="https://github.com/piyushSharma97/nextjs-ai-app"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-white text-sm transition-colors"
      >
        View on GitHub →
      </a>
    </main>
  );
}
