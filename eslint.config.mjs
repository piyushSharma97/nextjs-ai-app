/**
 * ESLint Configuration (Flat Config Format)
 * File: eslint.config.mjs
 * 
 * Concepts Demonstrated:
 * 1. ESLint 9 Flat Config:
 *    - ESLint 9 transitioned to "Flat Config" (`eslint.config.mjs`) as the standard,
 *      replacing the legacy `.eslintrc.json` cascading configuration system.
 *    - Flat configs are regular JavaScript/MJS modules that export an array of configuration objects.
 * 2. Next.js Rule Presets:
 *    - `eslint-config-next/core-web-vitals`: Enforces Next.js-specific lint rules and optimizations
 *      (e.g., using `next/image` instead of `<img>`, `next/link` instead of raw `<a>`, proper script tags).
 *    - `eslint-config-next/typescript`: Integrates `@typescript-eslint` rules tuned specifically for Next.js codebases.
 * 3. Global Ignores:
 *    - `globalIgnores(...)` replaces the older `.eslintignore` file.
 *    - Prevents ESLint from inspecting compiler build artifacts (`.next/**`, `out/**`, `build/**`)
 *      and auto-generated declaration files like `next-env.d.ts`.
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Core Web Vitals and standard Next.js recommendations
  ...nextVitals,

  // TypeScript static analysis and type-safety rules
  ...nextTs,

  // Global ignore paths (replaces .eslintignore)
  globalIgnores([
    ".next/**",       // Next.js build and cache directory
    "out/**",         // Static export output directory
    "build/**",       // Custom build destination
    "next-env.d.ts",  // Auto-generated Next.js TypeScript declarations
  ]),
]);

export default eslintConfig;
