/**
 * Next.js Configuration File
 * 
 * This file allows you to customize the behavior of the Next.js framework,
 * including compiler options, build configurations, asset optimizations,
 * environment variables, and experimental features.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
   * reactCompiler: Enables the React 19 Compiler (formerly React Forget).
   * It automatically optimizes and memoizes components and hooks under the hood,
   * reducing unnecessary re-renders without having to manually write
   * `useMemo` or `useCallback`.
   */
  reactCompiler: true,
};

export default nextConfig;
