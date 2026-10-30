/**
 * Root Layout Component (Next.js App Router)
 * 
 * In Next.js App Router (app directory), `layout.tsx` is the top-level wrapper
 * for the entire application. It defines the root `<html>` and `<body>` tags
 * and persists across page navigations without re-rendering unnecessarily.
 * 
 * Concepts Demonstrated:
 * 1. Next.js Font Optimization (`next/font/google`):
 *    - Fonts are downloaded at build time and self-hosted with static assets.
 *    - No external network requests are sent to Google Fonts at runtime (privacy-friendly & fast).
 *    - Automatically handles `font-display: swap` to eliminate layout shift (CLS).
 * 2. Static Metadata (`Metadata` export):
 *    - Defines document head properties (e.g., `<title>`, `<meta name="description">`)
 *      for search engines and social sharing previews.
 * 3. Server Component Default:
 *    - By default, files in Next.js App Router are React Server Components (RSC).
 *    - They render on the server and send lightweight HTML to the client.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';

// Configure the Geist Sans font family and inject it as a CSS variable (--font-geist-sans)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the Geist Mono font family and inject it as a CSS variable (--font-geist-mono)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next.js Metadata API: sets standard HTML <head> tags
export const metadata: Metadata = {
  title: "Next.js AI SDK Playground | Piyush Sharma",
  description: "AI application with streaming chat, multi-modal, structured data extraction — built with Next.js 14, Vercel AI SDK, TypeScript",
};

/**
 * RootLayout wraps all route pages in the application.
 * 
 * @param children - The active page or nested layout component being rendered
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Attach the generated font CSS variables and anti-aliasing utility to the body tag
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
