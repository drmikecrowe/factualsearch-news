/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_RSS2JSON_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Custom Search Engine API types
declare global {
  interface Window {
    google?: {
      search?: {
        Cse: {
          new (element: HTMLElement, options?: { defaultToRefinement?: string }): void;
        };
      };
    };
  }
}
