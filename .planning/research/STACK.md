# Stack Research

**Domain:** React SPA to Astro 5 + Svelte 5 Migration
**Researched:** 2025-02-15
**Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | 5.17.2+ | Static site framework | Islands architecture enables zero-JS by default while allowing interactivity where needed. Native support for Svelte 5 islands. Excellent for content-driven sites like factualSearch.news. |
| **Svelte** | 5.51.2+ | Interactive islands | Smallest runtime of any framework (~2KB vs React's 40KB+). Runes system ($state, $derived, $effect) provides explicit reactivity that's easier to reason about than React hooks. First-class Astro integration. |
| **TypeScript** | 5.x | Type safety | Already in use (45 TS files). Astro has excellent TypeScript support out of the box. |

### Styling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tailwind CSS** | 4.1.18+ | Utility-first CSS | Replaces styled-components (deprecated in 2025). 10x faster build times than v3. Native Astro 5.2+ support via `@tailwindcss/vite` plugin. Matches Bootstrap 4 utility patterns. |
| **@tailwindcss/vite** | Latest | Vite plugin | Required for Tailwind v4. Simpler configuration than v3 (no tailwind.config.ts needed). |

### Content & Data

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@astrojs/mdx** | 4.3.13+ | MDX content | Enables Markdown + components for static content pages. Replaces static JSON data approach with type-safe content collections. |
| **Astro Content Collections** | Built-in | Type-safe content | Zod-based schema validation. Query API for filtering content. Built into Astro 5 core. |

### Integrations

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@astrojs/svelte** | 7.2.5+ | Svelte integration | Required for Svelte components in Astro. Supports Svelte 5's async rendering. |
| **@astrojs/sitemap** | 3.7.0+ | SEO sitemaps | Auto-generates sitemap.xml during build. Critical for SEO. |

### SEO (Replaces React Helmet)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@astrojs/seo** | Latest | Meta tag management | Astro-native alternative to React Helmet. Works with static output. Handles Open Graph, Twitter cards, canonical URLs. |
| **Astro `<head>`** | Built-in | Direct head manipulation | Astro allows direct `<head>` editing in .astro files - no library needed for basic SEO. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vite** (built-in) | Build tool | Included with Astro. Fast HMR, optimized builds. |
| **ESLint + Prettier** | Code quality | Standard tooling. Use eslint-plugin-astro and eslint-plugin-svelte. |
| **Playwright/Vitest** | Testing | Astro outputs raw HTML, enabling E2E tests. |

## Installation

```bash
# Create new Astro project
npm create astro@latest

# Add core integrations
npx astro add svelte mdx sitemap

# Install Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# Install SEO package
npm install @astrojs/seo
```

### astro.config.mjs Configuration

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://factualsearch.news',
  output: 'static',
  integrations: [
    svelte(),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Global CSS (src/styles/global.css)

```css
@import "tailwindcss";
```

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Svelte 5 | Preact | Preact is React-compatible but still carries React mental model. Svelte's compile-time approach produces smaller bundles and simpler code. No hooks complexity. |
| Svelte 5 | Qwik | Qwik's resumability is innovative but overkill for static content sites. Smaller ecosystem. Steeper learning curve from React. |
| Svelte 5 | SolidJS | Excellent performance but JSX-based. Svelte's template syntax is closer to HTML, easier migration from React JSX than expected. |
| Tailwind CSS 4 | CSS Modules | Tailwind matches Bootstrap 4's utility pattern. Faster development. Better for component-focused architecture. |
| Tailwind CSS 4 | vanilla-extract | Zero-runtime CSS-in-JS but adds complexity. Tailwind's utility-first approach is more productive. |
| Astro Content Collections | Static JSON files | Content Collections provide type safety, schema validation, and query capabilities. Worth the migration. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **styled-components** | Deprecated in 2025, poor SSR support, runtime overhead | Tailwind CSS 4 |
| **React 16.7** | Heavy bundle (40KB+), hooks complexity, not needed for static output | Svelte 5 islands |
| **Bootstrap 4** | Dated styling system, conflicts with Tailwind utilities | Tailwind CSS 4 |
| **React Helmet** | Requires React runtime, not needed with Astro's native head management | @astrojs/seo or Astro `<head>` |

| **Create React App** | Deprecated, heavy, poor DX compared to modern tooling | Astro CLI |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Astro 5.17.2+ | @astrojs/svelte 7.x | Requires Astro 5.x for Svelte 5 support |
| Astro 5.2+ | Tailwind CSS 4.x | Native Tailwind v4 support via @tailwindcss/vite |
| Svelte 5.x | @astrojs/svelte 7.x | Svelte 4 not supported in v7 integration |
| Node.js | 18.14.1+ | Astro 5 minimum requirement |

## S3 Static Hosting Deployment

For S3 + CloudFront deployment (existing infrastructure):

1. **Build command**: `npm run build` outputs to `dist/`
2. **S3 sync**: Use AWS CLI or GitHub Actions to sync `dist/` to S3 bucket
3. **CloudFront**: Configure for S3 origin, enable compression
4. **Cache invalidation**: Invalidate CloudFront cache on deploy

**Recommended GitHub Actions setup:**
- Use `aws-actions/configure-aws-credentials` with OIDC federation
- Sync with `aws s3 sync dist/ s3://bucket-name --delete`
- Invalidate with `aws cloudfront create-invalidation`

## Migration-Specific Notes

### React to Svelte 5 Syntax Mapping

| React Pattern | Svelte 5 Pattern |
|---------------|------------------|
| `useState(0)` | `let count = $state(0)` |
| `useEffect(() => {}, [deps])` | `$effect(() => { /* deps auto-detected */ })` |
| `useMemo(() => x * 2, [x])` | `const double = $derived(x * 2)` |
| `props.foo` | `let { foo } = $props()` |
| `onClick={handler}` | `onclick={handler}` |
| `{children}` | `{@render children()}` |

### CSS Migration Path

1. **styled-components to Tailwind**: Use [styled2tailwind](https://github.com/Blazity/styled2tailwind) tool for automated conversion
2. **Bootstrap utilities to Tailwind**: Most Bootstrap utilities have Tailwind equivalents (e.g., `mt-3` stays `mt-3`)
3. **Inline styles**: Convert to Tailwind classes or use Astro `<style>` blocks

## Sources

- **Astro Official Docs** - https://docs.astro.build/en/guides/migrate-to-astro/from-create-react-app/ (HIGH confidence)
- **Svelte 5 Migration Guide** - https://svelte.dev/docs/svelte/v5-migration-guide (HIGH confidence)
- **Tailwind CSS Astro Guide** - https://tailwindcss.com/docs/installation/framework-guides/astro (HIGH confidence)
- **Astro 5.2 Tailwind 4 Support** - https://astro.build/blog/astro-520/ (HIGH confidence)
- **npm registry** - Version lookups for all packages (HIGH confidence)
- **styled-components deprecation** - https://blogs.utkarshrajput.com/styled-components-fading-out-in-2025 (MEDIUM confidence)
- **Svelte 5 vs React comparison** - https://dev.to/kouta222/the-next-big-things-in-frontend-svelte-astro-qwik-solid-2025-edition-2fnf (MEDIUM confidence)
- **Astro AWS Deployment** - https://docs.astro.build/en/guides/deploy/aws/ (HIGH confidence)
- **styled2tailwind tool** - https://github.com/Blazity/styled2tailwind (MEDIUM confidence)

---
*Stack research for: React SPA to Astro 5 + Svelte 5 Migration*
*Researched: 2025-02-15*
