/**
 * PostCSS Configuration File
 * File: postcss.config.mjs
 * 
 * Concepts Demonstrated:
 * 1. PostCSS in Next.js:
 *    - PostCSS is a CSS tool that transforms stylesheets using JavaScript plugins.
 *    - Next.js automatically detects `postcss.config.mjs` and executes it during builds.
 * 2. Tailwind CSS v4 Integration:
 *    - `@tailwindcss/postcss`: The official PostCSS plugin for Tailwind CSS version 4.
 *    - In Tailwind v4, the architecture is streamlined: autoprefixing and `@import` resolution
 *      are handled natively by `@tailwindcss/postcss`, eliminating the need for standalone
 *      `autoprefixer` or `tailwind.config.js` files.
 */

const config = {
  plugins: {
    // Enable the Tailwind CSS v4 PostCSS compilation pipeline
    "@tailwindcss/postcss": {},
  },
};

export default config;
