# Phase 1: Foundation - Research

**Researched:** 2026-02-15
**Domain:** Astro 5 project infrastructure with Tailwind CSS 4, Google Analytics, and SEO
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational infrastructure for the factualSearch.news migration. The core work involves initializing an Astro 5 project with static output, configuring Tailwind CSS 4 using the new Vite plugin approach (not the legacy tailwind.config.ts pattern), creating a BaseLayout that replaces React Helmet for head management, integrating Google Analytics with continuous tracking from day one, and configuring sitemap generation for SEO parity.

**Primary recommendation:** Use the official `@tailwindcss/vite` plugin for Tailwind CSS 4 integration (not tailwind.config.ts), and place Google Analytics as an inline script in BaseLayout.astro to ensure tracking continuity during migration.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.2+ | Static site framework | Primary framework for migration, islands architecture |
| Tailwind CSS | 4.1.18+ | Utility-first CSS | Replaces styled-components, better performance |
| @tailwindcss/vite | 4.1.18+ | Tailwind Vite plugin | Official v4 approach, no config file needed |
| @astrojs/sitemap | 3.7.0+ | Sitemap generation | Official Astro integration, automatic sitemap-index.xml |
| @astrojs/svelte | 7.0.0+ | Svelte integration | Required for future interactive islands |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/mdx | 4.0.0+ | MDX content support | Phase 3 for content pages |
| sharp | 0.33+ | Image optimization | When adding images |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/vite | tailwind.config.ts + PostCSS | Legacy approach, more config, v4 docs focus on Vite plugin |
| @astrojs/sitemap | Manual sitemap.xml | Manual maintenance, error-prone, no automation |
| Inline GA script | @astrojs/partytown | Overkill for simple GA tracking, adds complexity |

**Installation:**
```bash
npm create astro@latest .
npm install tailwindcss @tailwindcss/vite
npm install @astrojs/sitemap
npm install @astrojs/svelte svelte@5
```

## Architecture Patterns

### Recommended Project Structure
```
src/
+-- pages/                    # File-based routing
|   +-- index.astro           # Home page (placeholder)
+-- layouts/
|   +-- BaseLayout.astro      # HTML shell, global meta, analytics
+-- components/               # Future components (empty for now)
+-- styles/
|   +-- global.css            # Tailwind imports, global styles
+-- env.d.ts                  # Environment type definitions
astro.config.mjs              # Astro + Vite + integrations config
```

### Pattern 1: Tailwind CSS 4 with Vite Plugin
**What:** Tailwind v4 uses `@tailwindcss/vite` plugin instead of tailwind.config.ts. Configuration happens via CSS imports and Vite config.

**When to use:** All Tailwind v4 projects. This is the new standard approach.

**Example:**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";

/* Custom theme extensions */
@theme {
  --color-primary: #3b82f6;
}
```

### Pattern 2: BaseLayout with Inline GA Script
**What:** BaseLayout.astro handles all head management, replacing React Helmet. Google Analytics runs as an inline script for immediate execution.

**When to use:** All pages. This ensures GA tracking from the first page load.

**Example:**
```astro
---
// src/layouts/BaseLayout.astro
const { title, description } = Astro.props;
const siteUrl = Astro.site;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={siteUrl} />

  <!-- Google Analytics (inline for immediate execution) -->
  <script is:inline>
    // GA4 tracking code
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  </script>
  <script is:inline src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
</head>
<body>
  <slot />
</body>
</html>
```

### Pattern 3: Sitemap Configuration
**What:** @astrojs/sitemap automatically generates sitemap-index.xml during build. Requires `site` config in astro.config.mjs.

**When to use:** All production sites for SEO.

**Example:**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://factualsearch.news',
  integrations: [sitemap()]
});
```

**Output:** `dist/sitemap-index.xml` + individual sitemap files

### Anti-Patterns to Avoid
- **Using tailwind.config.ts with Tailwind v4:** The v4 approach uses CSS-based config. Old config files are ignored.
- **Client-side only GA:** Delays tracking, loses initial page views. Use inline script in layout.
- **Missing site URL:** Sitemap generation fails silently without `site` in config.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Manual XML files | @astrojs/sitemap | Automatic, handles changes, proper format |
| CSS utility system | Custom CSS utilities | Tailwind CSS | Battle-tested, consistent, smaller bundle |
| Head management | Manual meta tags | Astro layouts | DRY, type-safe, slot-based composition |
| GA integration | Custom tracking wrapper | Inline GA script | Official approach, no complexity |

**Key insight:** Astro's static-first architecture eliminates the need for React Helmet complexity. Layout composition handles head management naturally.

## Common Pitfalls

### Pitfall 1: Analytics Data Gap During Migration
**What goes wrong:** Google Analytics tracking stops or creates gaps when migrating between tech stacks. The migration window is when tracking is most vulnerable.

**Why it happens:** GA tracking code placement differs between React (client-side injected) and Astro (can be server-rendered). React Helmet's GA injection doesn't map 1:1 to Astro's head management.

**How to avoid:**
1. Place GA as inline `<script is:inline>` in BaseLayout.astro
2. Verify GA debug mode works on first page before proceeding
3. Document GA property ID in environment variables

**Warning signs:**
- GA Real-Time shows 0 users when traffic exists
- Console shows "Google Analytics not defined" errors

### Pitfall 2: SEO Ranking Drop After Migration
**What goes wrong:** Search rankings drop after removing React Helmet, even though pages render correctly.

**Why it happens:** Meta tags not properly transferred, canonical URLs missing, sitemap not configured.

**How to avoid:**
1. Audit current meta tags before migration
2. Implement all meta tags in BaseLayout.astro
3. Configure @astrojs/sitemap immediately
4. Test with Google Search Console

**Warning signs:**
- Google Search Console shows "Duplicate without user-selected canonical"
- Social shares don't show preview cards

### Pitfall 3: Tailwind v4 Config Confusion
**What goes wrong:** Developers try to use tailwind.config.ts with Tailwind v4, which is ignored.

**Why it happens:** Tailwind v4 changed the configuration approach. Many tutorials still reference v3 patterns.

**How to avoid:**
1. Use `@tailwindcss/vite` plugin in Vite config
2. Import tailwindcss in main CSS file: `@import "tailwindcss";`
3. Use `@theme` directive in CSS for custom values

**Warning signs:**
- Tailwind classes not working
- Build succeeds but styles missing

## Code Examples

Verified patterns from official sources:

### Astro Config with All Phase 1 Integrations
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://factualsearch.news',
  integrations: [
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
```
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro

### Global CSS with Tailwind v4
```css
/* src/styles/global.css */
@import "tailwindcss";

/* Optional: Custom theme values */
@theme {
  --font-family-sans: 'Inter', system-ui, sans-serif;
}
```
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro

### BaseLayout with Complete Head Management
```astro
---
// src/layouts/BaseLayout.astro
export interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />

    <!-- Primary Meta Tags -->
    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />

    <!-- Canonical -->
    <link rel="canonical" href={canonicalURL} />

    <!-- Google Analytics -->
    <script is:inline src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```
// Source: https://docs.astro.build/en/basics/layouts/

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.ts | @tailwindcss/vite + CSS @theme | Tailwind v4 (2025) | Simpler config, better DX |
| React Helmet | Astro layouts | N/A (framework difference) | No runtime overhead |
| Client-side GA injection | Inline server-rendered script | Astro best practice | Immediate tracking |

**Deprecated/outdated:**
- tailwind.config.ts: Tailwind v4 ignores this file. Use CSS-based configuration.
- PostCSS-based Tailwind: Vite plugin is the new standard for v4.

## Open Questions

1. **What is the actual GA Measurement ID?**
   - What we know: Need to use the existing property from the React app
   - What's unclear: The specific ID value
   - Recommendation: Extract from current React app config, store in environment variable as `PUBLIC_GA_ID`

2. **Should we use GA4 or Universal Analytics?**
   - What we know: GA4 is the current standard
   - What's unclear: What the existing site uses
   - Recommendation: Use GA4 (Universal Analytics deprecated July 2023)

## Sources

### Primary (HIGH confidence)
- Context7 - Tailwind CSS Astro integration patterns
- https://tailwindcss.com/docs/installation/framework-guides/astro - Official Tailwind + Astro guide
- https://docs.astro.build/en/guides/data-fetching/ - Astro data fetching patterns
- https://docs.astro.build/en/guides/sitemap/ - Official sitemap integration docs

### Secondary (MEDIUM confidence)
- https://docs.astro.build/en/basics/layouts/ - Astro layout documentation
- Existing project research: `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md`

### Tertiary (LOW confidence)
- WebSearch for 2026 Tailwind CSS 4 patterns (verified with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified from official docs and existing research
- Architecture: HIGH - Patterns from official Tailwind and Astro documentation
- Pitfalls: MEDIUM - Based on migration research and common patterns, some from WebSearch

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable framework versions)
