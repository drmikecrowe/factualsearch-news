/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

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
