import Image from "next/image";

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Next.js AI SDK Playground</h1>
      <p>Built by Piyush Sharma — Bangalore</p>
      
      <h2>Features Built</h2>
      <ul>
        <li>💬 <a href="/ui/chat">Streaming Chat</a></li>
        <li>✅ <a href="/ui/completion">Completion</a></li>
        <li>🖼️ <a href="/ui/multi-modal">Multi-Modal</a></li>
        <li>📊 <a href="/ui/structured-data">Structured Data</a></li>
        <li>🔄 <a href="/ui/stream">Stream</a></li>
      </ul>

      <h2>Tech Stack</h2>
      <ul>
        <li>Next.js 14 App Router</li>
        <li>Vercel AI SDK</li>
        <li>OpenAI GPT-4.1-nano</li>
        <li>TypeScript</li>
      </ul>
    </main>
  );
}
