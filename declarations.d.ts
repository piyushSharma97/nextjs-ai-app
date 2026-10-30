/**
 * TypeScript Ambient Module Declarations
 * 
 * In TypeScript, files ending with `.d.ts` are declaration files.
 * They do not produce JavaScript output; instead, they provide type
 * information to the TypeScript compiler about code implemented elsewhere
 * (e.g., globals, CSS files, assets, non-TS libraries).
 */

// Informs the TypeScript compiler that any import ending with `.css`
// (e.g. `import './globals.css'`) is a valid module.
// Without this declaration, TS might raise error TS2307: "Cannot find module '*.css'".
declare module '*.css';
