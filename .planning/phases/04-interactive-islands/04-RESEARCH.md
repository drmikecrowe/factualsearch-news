# Phase 4: Interactive Islands - Research

**Researched:** 2026-02-15
**Domain:** Svelte 5 islands with Astro 5 for Google CSE search and RSS feed integration
**Confidence:** HIGH

## Summary

Phase 4 implements interactive functionality using Svelte 5 islands within the Astro 5 static site. The core work involves migrating the Google Custom Search Engine (CSE) integration from React's componentDidMount script injection to a Svelte island with proper client directive, converting the RSS feed fetching components (MbfcNews, MbfcPosts) to use Svelte 5's `$state` and `$effect` runes instead of React lifecycle methods, 

**Primary recommendation:** Use `client:load` for Search.svelte (immediate interactivity needed) and `client:visible` for RSS feed components (defer until visible).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @astrojs/svelte | 7.0.0+ | Svelte integration for Astro | Official Astro integration, supports Svelte 5 |
| Svelte | 5.0+ | Reactive UI components | Latest with runes ($state, $effect), better DX |


### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | All functionality via native Svelte/astro APIs | - |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|

| client:visible for Search | client:only="svelte" | Immediate hydration but loads JS even if user doesn't search |
| PUBLIC_ env vars | astro:env schema | More type-safe but requires config schema, PUBLIC_ simpler |

**Installation:**
```bash
# Already installed in Phase 1
npm install @astrojs/svelte svelte@5
```

## Architecture Patterns

### Recommended Project Structure
```
src/
+-- components/
|   +-- islands/
|   |   +-- Search.svelte         # Google CSE search island
|   |   +-- MbfcNews.svelte       # RSS news feed island
|   |   +-- MbfcPosts.svelte      # RSS posts feed island
+-- pages/
|   +-- index.astro               # Uses Search island
|   +-- about.astro               # Uses MbfcNews, MbfcPosts islands
+-- env.d.ts                      # Environment type definitions
.env                              # PUBLIC_RSS2JSON_API_KEY=xxx
```

### Pattern 1: Google CSE Integration with Svelte Island
**What:** Search.svelte island loads Google CSE script and renders the search widget. Uses `client:load` since search is the primary user action.

**When to use:** Interactive third-party widgets that need script injection.

**Example:**
```svelte
<!-- src/components/islands/Search.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  const CSE_ID = '011275290256739755566:cwfn9qhuqkk';

  onMount(() => {
    // Load Google CSE script
    const script = document.createElement('script');
    script.src = `https://cse.google.com/cse.js?cx=${CSE_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      script.remove();
    };
  });
</script>

<main role="main" class="search">
  <h2>Search News Sites with Highly Factual Reporting:</h2>
  <div class="gcse-search" data-defaultToRefinement="mostly-center"></div>
</main>
```

**Usage in Astro:**
```astro
---
import Search from '../components/islands/Search.svelte';
---
<Search client:load />
```

### Pattern 2: RSS Feed with Svelte 5 Runes
**What:** MbfcNews.svelte uses `$state` for reactive feed data and `$effect` for fetching. Uses `client:visible` to defer loading until component is in viewport.

**When to use:** Data-fetching components where loading can be deferred.

**Example:**
```svelte
<!-- src/components/islands/MbfcNews.svelte -->
<script lang="ts">
  interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
  }

  let news = $state<FeedItem[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const RSS_URL = 'https://mediabiasfactcheck.com/feed/';
  const API_KEY = import.meta.env.PUBLIC_RSS2JSON_API_KEY;

  $effect(() => {
    const fetchNews = async () => {
      try {
        const encodedRss = encodeURIComponent(RSS_URL);
        const response = await fetch(
          `
        );
        const data = await response.json();

        if (data?.items?.length > 0) {
          news = data.items;
        }
      } catch (e) {
        error = 'Failed to load news';
        console.error('RSS fetch error:', e);
      } finally {
        loading = false;
      }
    };

    fetchNews();
  });
</script>

{#if loading}
  <p>Loading news...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <ul>
    {#each news as item}
      <li>
        <a href={item.link}>{item.title}</a>
        <span class="date">{new Date(item.pubDate).toLocaleDateString()}</span>
      </li>
    {/each}
  </ul>
{/if}
```

**Usage in Astro:**
```astro
---
import MbfcNews from '../components/islands/MbfcNews.svelte';
---
<MbfcNews client:visible />
```

### Pattern 3: Environment Variables for Client-Side Access
**What:** Use `PUBLIC_` prefix for environment variables that need to be accessible in browser code. Astro automatically exposes these via `import.meta.env`.

**When to use:** Any client-side API keys or configuration.

**Example:**
```bash
# .env
PUBLIC_RSS2JSON_API_KEY=your-rss2json-api-key
```

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly PUBLIC_RSS2JSON_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

```svelte
<!-- Access in Svelte -->
<script lang="ts">
  const API_KEY = import.meta.env.PUBLIC_RSS2JSON_API_KEY;
</script>
```

### Client Directive Selection Guide

| Directive | Use When | Search | RSS Feeds |
|-----------|----------|--------|-----------|
| `client:load` | Immediate interactivity required | YES | NO |
| `client:visible` | Defer until in viewport | NO | YES |
| `client:only="svelte"` | No SSR needed (third-party) | ALT | NO |
| `is:inline` | Script must run immediately (outside component) | ALT | NO |

### Anti-Patterns to Avoid
- **Using `client:only` when `client:load` works:** Loses SSR benefits, increases initial bundle
- **Using React lifecycle terms:** Svelte 5 uses `$effect`, not `useEffect` or `componentDidMount`
- **Fetching in `$effect` without cleanup:** Can cause race conditions, memory leaks

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|

| State management | Custom reactive system | Svelte 5 runes ($state, $effect) | Built-in, efficient, no extra dependency |
| Script injection | Manual DOM manipulation in Astro | Svelte onMount | Cleanup handled, component-scoped |
| Environment config | Custom config loader | Astro PUBLIC_ env vars | Type-safe, zero config |

**Key insight:** Svelte 5's runes provide React-like reactivity without hooks complexity. `$effect` replaces both `componentDidMount` and `useEffect`.

## Common Pitfalls

### Pitfall 1: Wrong Client Directive Choice
**What goes wrong:** Using `client:visible` for Search delays interactivity. Using `client:load` for RSS loads JS before user scrolls to content.

**Why it happens:** Developers treat all islands the same, not considering user interaction patterns.

**How to avoid:**
1. Identify primary user action (Search = primary, RSS = secondary)
2. Primary interactions use `client:load`
3. Below-fold content uses `client:visible`

**Warning signs:**
- Users click search box before it's interactive
- Page load metrics degraded by unnecessary JS





### Pitfall 4: Svelte 5 Runes Confusion
**What goes wrong:** Using React patterns (useEffect, useState) or Svelte 4 patterns (let with $: reactive).

**Why it happens:** Documentation mixed between Svelte versions.

**How to avoid:**
1. Use `$state` for reactive variables (not `let` with `$:`)
2. Use `$effect` for side effects (not `onMount` alone or `useEffect`)
3. `onMount` still valid for mount-only logic

**Warning signs:**
- Console warnings about deprecated syntax
- State not updating reactively

## Code Examples

Verified patterns from official sources:

### Complete Search.svelte Island
```svelte
<!-- src/components/islands/Search.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  // CSE ID from original app.constants.ts
  const CSE_ID = '011275290256739755566:cwfn9qhuqkk';
  let loaded = $state(false);

  onMount(() => {
    // Check if CSE already loaded
    if (window.google?.search?.Cse) {
      loaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://cse.google.com/cse.js?cx=${CSE_ID}`;
    script.async = true;
    script.onload = () => { loaded = true; };
    document.head.appendChild(script);

    return () => {
      // Cleanup - remove script if component unmounts
      script.remove();
    };
  });
</script>

<main role="main" class="search">
  <h2>Search News Sites with Highly Factual Reporting:</h2>
  {#if !loaded}
    <p>Loading search...</p>
  {/if}
  <div class="gcse-search" data-defaultToRefinement="mostly-center"></div>
</main>

<style>
  .search {
    /* Tailwind classes or scoped styles */
  }
</style>
```
// Source: https://docs.astro.build/en/guides/integrations-guide/svelte/ + Svelte docs

### Complete MbfcNews.svelte Island
```svelte
<!-- src/components/islands/MbfcNews.svelte -->
<script lang="ts">
  interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    content: string;
    author: string;
    thumbnail: string;
  }

  interface Rss2JsonResponse {
    status: string;
    feed: {
      title: string;
      description: string;
    };
    items: FeedItem[];
  }

  let news = $state<FeedItem[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const RSS_URL = 'https://mediabiasfactcheck.com/feed/';
  const API_KEY = import.meta.env.PUBLIC_RSS2JSON_API_KEY;

  $effect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      try {
        const encodedRss = encodeURIComponent(RSS_URL);
        const response = await fetch(
          `,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: Rss2JsonResponse = await response.json();

        if (data.status === 'ok' && data.items?.length > 0) {
          news = data.items;
        } else {
          error = 'No news available';
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          error = 'Failed to load news';
          console.error('RSS fetch error:', e);
        }
      } finally {
        loading = false;
      }
    };

    fetchNews();

    return () => controller.abort();
  });
</script>

<section class="mbfc-news">
  <h2>Latest from Media Bias/Fact Check</h2>

  {#if loading}
    <p class="loading">Loading news...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <ul class="news-list">
      {#each news.slice(0, 5) as item}
        <li>
          <a href={item.link} target="_blank" rel="noopener">
            {item.title}
          </a>
          <time datetime={item.pubDate}>
            {new Date(item.pubDate).toLocaleDateString()}
          </time>
        </li>
      {/each}
    </ul>
  {/if}
</section>
```
// Source: https://svelte-5-preview.vercel.app/docs/runes + Astro Svelte docs

### Environment Variable Type Definitions
```typescript
// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Client-side accessible (PUBLIC_ prefix)
  readonly PUBLIC_RSS2JSON_API_KEY: string;
  // Add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```
// Source: https://docs.astro.build/en/guides/environment-variables/

### Usage in Astro Page
```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Search from '../components/islands/Search.svelte';
---

<BaseLayout title="factualSearch.news" description="Search factual news sources">
  <h1>Welcome to factualSearch.news</h1>
  <Search client:load />
</BaseLayout>
```
// Source: https://docs.astro.build/en/guides/integrations-guide/svelte/

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React componentDidMount | Svelte onMount + $effect | Svelte 5 (2024) | Cleaner lifecycle, automatic cleanup |
| React useState | Svelte $state rune | Svelte 5 (2024) | Finer-grained reactivity |
| React useEffect | Svelte $effect rune | Svelte 5 (2024) | Simpler side effects |
| Hardcoded API keys | PUBLIC_ env vars | Astro always | Security, configurability |

**Deprecated/outdated:**
- Svelte 4 reactive declarations (`$:`): Use `$state` and `$effect` instead
- React patterns (useEffect, useState): Not applicable in Svelte islands

## Open Questions

1. **RSS feed freshness strategy: client-side vs build-time?**

   - What's unclear: Whether build-time with revalidation would be better
   - Recommendation: Use client-side with `client:visible` - acceptable staleness (1 hour cache), preserves SSG benefits

2. **Google CSE script injection: onMount vs is:inline?**
   - What we know: Both approaches work; onMount provides cleanup, is:inline is immediate
   - What's unclear: Which is more reliable for third-party widget loading
   - Recommendation: Use onMount in Svelte component - cleaner encapsulation, proper cleanup, component-scoped

## Sources

### Primary (HIGH confidence)
- https://docs.astro.build/en/guides/integrations-guide/svelte/ - Official Astro Svelte integration docs
- https://svelte-5-preview.vercel.app/docs/runes - Official Svelte 5 runes documentation
- https://svelte-5-preview.vercel.app/docs/lifecycle-hooks - Official Svelte 5 lifecycle docs
- https://docs.astro.build/en/guides/environment-variables/ - Official Astro environment variables docs

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` - Project architecture research
- `.planning/phases/01-foundation/01-RESEARCH.md` - Phase 1 research (established patterns)


### Tertiary (LOW confidence)
- WebSearch for Astro Svelte 5 client directive patterns 2026 - Verified with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions from official docs, matches Phase 1 research
- Architecture: HIGH - Patterns from official Astro and Svelte documentation
- Pitfalls: MEDIUM - Based on migration research and common patterns, some from experience

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable framework versions)
