

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">
        🤖 Next.js AI SDK Playground
      </h1>
      <p className="text-gray-400 mb-8">
        Built by Piyush Sharma — Frontend AI Engineer — Bangalore
      </p>

      <h2 className="text-2xl font-semibold mb-4">Features Built</h2>
      <div className="grid gap-3 mb-8">
        {[
          { emoji: '💬', name: 'Streaming Chat', href: '/ui/chat', desc: 'Real-time AI with token tracking' },
          { emoji: '✅', name: 'Completion', href: '/ui/completion', desc: 'Text completion with OpenAI' },
          { emoji: '🖼️', name: 'Multi-Modal', href: '/ui/multi-modal', desc: 'Text and image understanding' },
          { emoji: '📊', name: 'Structured Data', href: '/ui/structured-data', desc: 'AI data extraction' },
          { emoji: '🔄', name: 'Stream', href: '/ui/stream', desc: 'Raw streaming responses' },
        ].map(f => (
          <a key={f.name} href={f.href}
            className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
            <span className="text-2xl">{f.emoji}</span>
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
            <span className="ml-auto text-gray-600">→</span>
          </a>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {['Next.js 14', 'Vercel AI SDK', 'OpenAI GPT-4.1-nano', 'TypeScript', 'App Router'].map(t => (
          <span key={t} className="px-3 py-1 bg-white text-black rounded-full text-sm font-medium">
            {t}
          </span>
        ))}
      </div>

      <a href="https://github.com/piyushSharma97/nextjs-ai-app"
        className="text-gray-500 hover:text-white text-sm transition-colors">
        View on GitHub →
      </a>
    </main>
  );
}
