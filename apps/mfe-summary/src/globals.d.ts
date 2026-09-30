// Side-effect CSS imports are handled by webpack loaders, not by TypeScript.
declare module '*.css';

// Substituted at build time by webpack: the only Node global this browser
// code touches, and only to keep the development mock out of production.
declare const process: { env: { NODE_ENV?: string } };
