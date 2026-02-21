# Architecture Research

**Domain:** Astro 5 + Svelte 5 Static Site (Migration from React SPA)
**Researched:** 2026-02-15
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+------------------------------------------------------------------+
|                         ASTRO BUILD TIME                          |
+------------------------------------------------------------------+
|  +-------------+  +-------------+  +-------------------------+   |
|  | src/pages/  |  |src/content/ |  |   Data Fetching         |   |
|  | *.astro     |  | collections |  |   (RSS, APIs)           |   |
|  +------+------+  +------+------+  +------------+------------+   |
|         |                |                      |                 |
|         v                v                      v                 |
|  +-------------------------------------------------------------+ |
|  |                    ASTRO ROUTER                             | |
|  |  - File-based routing                                       | |
|  |  - Static HTML generation                                   | |
|  |  - Layout composition                                       | |
|  +----------------------+--------------------------------------+ |
|                         |                                        |
+-------------------------|----------------------------------------+
                          | Static HTML + Island Hydration Scripts
                          v
+------------------------------------------------------------------+
|                        CLIENT RUNTIME                             |
+------------------------------------------------------------------+
|  +-------------------+      +--------------------------------+   |
|  | Static HTML       |      |   Interactive Islands          |   |
|  | (no JS by default)|      |   (hydrated Svelte components) |   |
|  +-------------------+      +--------------------------------+   |
|                                    |                              |
|                         +----------+-----------+                  |
|                         v                      v                  |
|                  +-------------+       +---------------+         |
|                  | Search.tsx  |       | GoogleCSE.svelte|       |
|                  | (client:*)  |       | (client:only)  |         |
|                  +-------------+       +---------------+         |
+------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `src/pages/*.astro` | Route definitions, page-level composition | Astro components with frontmatter |
| `src/layouts/*.astro` | Shared page structure (header, footer, meta) | Astro layouts with `<slot />` |
| `src/components/*.svelte` | Interactive UI elements requiring JS | Svelte 5 components with `client:*` |
| `src/components/*.astro` | Static UI elements (no JS) | Pure Astro components |
| `src/content/` | MDX/Markdown content with schema validation | Content collections |
| `src/data/` | Build-time data fetching, RSS processing | TypeScript modules |

## Recommended Project Structure

```
src/
+-- pages/                    # File-based routing
|   +-- index.astro           # Home page
|   +-- about.astro           # About page
|   +-- sites.astro           # Sites listing
|   +-- privacy.astro         # Privacy policy
|   +-- terms.astro           # Terms of service
|   +-- embedded.astro        # Embedded version
|   +-- news/                 # News section
|   |   +-- index.astro       # News listing
|   |   +-- [slug].astro      # Individual news post (dynamic)
+-- layouts/
|   +-- BaseLayout.astro      # HTML shell, global meta, analytics
|   +-- PageLayout.astro      # Header + Footer wrapper
|   +-- EmbeddedLayout.astro  # Minimal layout for embed
+-- components/
|   +-- Search/
|   |   +-- Search.svelte     # Search island (client:visible)
|   |   +-- GoogleCSE.svelte  # Google CSE wrapper (client:only="svelte")
|   +-- Header/
|   |   +-- Header.astro      # Static navigation
|   |   +-- Nav.astro         # Nav links
|   +-- Footer/
|   |   +-- Footer.astro      # Static footer
|   +-- MbfcNews/
|   |   +-- MbfcNews.astro    # Static news list (build-time rendered)
|   |   +-- NewsCard.astro    # Individual news card
|   +-- MbfcPosts/
|   |   +-- MbfcPosts.astro   # RSS posts list (build-time fetched)
|   |   +-- PostCard.astro    # Individual post card
|   +-- Biases/
|   |   +-- Biases.astro      # Static bias information
|   +-- Sites/
|   |   +-- Sites.astro       # Static sites listing
|   +-- Hosts/
|   |   +-- Hosts.astro       # Static hosts information
|   +-- About/
|       +-- About.astro       # About page sections
|       +-- HelpUsOut.astro
|       +-- AboutThisSite.astro
|       +-- YourFirstSearch.astro
|       +-- FightingFakeNews.astro
|       +-- WhyUseThisSearch.astro
+-- content/
|   +-- config.ts             # Content collection schema
|   +-- news/                 # MDX news articles
|   |   +-- *.mdx
|   +-- pages/                # Static page content
|       +-- privacy.mdx
|       +-- terms.mdx
+-- data/
|   +-- rss.ts                # RSS feed fetching utilities
|   +-- sites.ts              # Sites data
|   +-- hosts.ts              # Hosts data
|   +-- constants.ts          # App constants (migrated from app.constants.ts)
+-- styles/
|   +-- global.css            # Global styles (replaces styled-components theme)
+-- env.d.ts                  # Environment type definitions
```

### Structure Rationale

- **pages/**: Astro uses file-based routing. Each `.astro` file becomes a route. Dynamic routes use `[param]` syntax.
- **layouts/**: Layouts wrap pages with shared structure. Nested layouts use `<slot />` for content injection. This replaces the React app.tsx wrapper pattern.
- **components/**: Split between `.astro` (static, zero JS) and `.svelte` (interactive). This is the core of islands architecture.
- **content/**: Content collections provide type-safe MDX/Markdown with schema validation. Replaces hard-coded content in React components.
- **data/**: Build-time data modules. RSS fetching, constants, and static data live here and are imported by pages/components during build.

## Architectural Patterns

### Pattern 1: Islands Architecture

**What:** Most content is static HTML with zero JavaScript. Only interactive "islands" hydrate with client-side JS.

**When to use:** Default for all content. Use islands only for:
- Interactive search (Google CSE)
- User-triggered interactions (filters, toggles)
- Third-party widgets requiring JS

**Trade-offs:**
- (+) Massive performance gains - minimal JS shipped
- (+) Better SEO - content is pre-rendered HTML
- (+) Faster TTI (Time to Interactive)
- (-) Requires thinking about hydration boundaries
- (-) Some React patterns (context, global state) need rethinking

**Example:**
```astro
---
// src/pages/index.astro
import Search from '../components/Search/GoogleCSE.svelte';
import Header from '../components/Header/Header.astro';
import MbfcPosts from '../components/MbfcPosts/MbfcPosts.astro';
---

<Header />
<main>
  <!-- Island: hydrates when visible in viewport -->
  <Search client:visible />

  <!-- Static: no JavaScript sent to client -->
  <MbfcPosts posts={posts} />
</main>
```

### Pattern 2: Client Directives

**What:** Directives control when/how Svelte components hydrate.

**When to use:**
- `client:load` - Immediately on page load (critical interactivity)
- `client:idle` - When browser is idle (non-critical widgets)
- `client:visible` - When element enters viewport (below-fold content)
- `client:media="{query}"` - When media query matches (responsive components)
- `client:only="svelte"` - Skip server render entirely (third-party only)

**Trade-offs:**
- (+) Fine-grained control over JS execution
- (+) Can defer non-critical JS indefinitely
- (-) Choosing wrong directive impacts UX

**Example:**
```astro
<!-- Search must work immediately -->
<Search client:load />

<!-- Google CSE needs client-only (external script dependency) -->
<GoogleCSE client:only="svelte" />

<!-- Analytics can wait -->
<Analytics client:idle />
```

### Pattern 3: Nested Layouts

**What:** Layouts can wrap other layouts, creating a hierarchy of shared structure.

**When to use:** When multiple page types share partial structure (e.g., all pages have analytics, but only main pages have header/footer).

**Trade-offs:**
- (+) DRY for shared page structure
- (+) Clear separation of concerns
- (-) Deep nesting can be confusing

**Example:**
```astro
---
// src/layouts/BaseLayout.astro
const { title } = Astro.props;
---
<!DOCTYPE html>
<html>
  <head>
    <title>{title}</title>
    <meta name="viewport" content="width=device-width" />
    <!-- Global analytics -->
    <script is:inline>
      // Google Analytics inline
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>

---
// src/layouts/PageLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/Header/Header.astro';
import Footer from '../components/Footer/Footer.astro';
---
<BaseLayout title={title}>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</BaseLayout>
```

### Pattern 4: Build-Time Data Fetching

**What:** Data fetching happens at build time in Astro frontmatter, not at runtime.

**When to use:** Static content, RSS feeds, API data that doesn't change per-request.

**Trade-offs:**
- (+) Zero runtime API calls = instant page loads
- (+) Works with any API without CORS issues
- (-) Data is stale until next rebuild
- (-) Need rebuild strategy for content updates

**Example:**
```astro
---
// src/pages/index.astro
import { fetchRSSFeeds } from '../data/rss';

// This runs at BUILD TIME
const posts = await fetchRSSFeeds();
---

<MbfcPosts posts={posts} />
```

## Data Flow

### Build-Time Flow

```
[Build Triggered]
       |
       v
[Astro Frontmatter] --fetch()--> [RSS Feeds / APIs]
       |                               |
       v                               v
[Data Processing] <----[Response]------
       |
       v
[Static HTML Generation]
       |
       v
[Deploy to S3]
```

### Client-Side Flow

```
[Page Load]
     |
     v
[Static HTML rendered instantly]
     |
     +---> [Island components hydrate based on client:* directive]
     |           |
     |           v
     |     [Svelte components interactive]
     |
     +---> [Google CSE loads via client:only]
```

### Key Data Flows

1. **RSS Feed Ingestion**: `src/data/rss.ts` exports `fetchRSSFeeds()` which is called in page frontmatter at build time. Returns processed post data that gets passed as props to static components.

2. **Content Collections**: MDX files in `src/content/news/` are queried via `getCollection()` in frontmatter. Schema validation in `src/content/config.ts` ensures type safety.

3. **Search Interaction**: Google CSE component (`client:only="svelte"`) loads the Google search widget entirely client-side. No server involvement.

4. **Analytics**: Inline `<script>` in `BaseLayout.astro` fires on every page load. No React HOC needed - it's just HTML.

## Component Classification: Islands vs Static

| Current React Component | Astro Classification | Rationale |
|------------------------|---------------------|-----------|
| `Search` | **Island** (`client:visible`) | Interactive search widget |
| `GoogleCSE` (new) | **Island** (`client:only="svelte"`) | External script dependency, no SSR |
| `Header` | **Static** (`.astro`) | Navigation links only |
| `Footer` | **Static** (`.astro`) | No interactivity |
| `MbfcNews` | **Static** (`.astro`) | Link list, build-time rendered |
| `MbfcPosts` | **Static** (`.astro`) | RSS feed, build-time fetched |
| `Biases` | **Static** (`.astro`) | Information display |
| `Sites` | **Static** (`.astro`) | Static listing |
| `Hosts` | **Static** (`.astro`) | Static listing |
| `About/*` | **Static** (`.astro`) | Content sections |
| `withTracker` HOC | **Removed** | Replaced by inline analytics in layout |

**Result**: Only 1-2 components need client-side hydration. Everything else is pure static HTML.

## Migration Strategy: Incremental Approach

### Phase 1: Parallel Coexistence

```
src/
+-- app/               # OLD React app (unchanged)
+-- astro/             # NEW Astro app
    +-- src/
        +-- pages/
        +-- components/
```

1. Initialize Astro project alongside React
2. Configure both to build independently
3. Deploy Astro to separate path or subdomain
4. Gradually move routes from React to Astro

### Phase 2: Route-by-Route Migration

1. Start with static pages (Privacy, Terms, About)
2. Move content-heavy pages (Sites, Biases, Hosts)
3. Migrate RSS-fed content (MbfcNews, MbfcPosts)
4. Finally migrate search functionality
5. Update DNS/routing to point to Astro

### Phase 3: Cleanup

1. Remove React app
2. Archive `src/app/`
3. Update CI/CD for Astro-only build

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Standard Astro static build is sufficient |
| 1k-100k users | Add CDN caching, consider ISR for RSS feeds |
| 100k+ users | Add `server:defer` for heavy components, edge caching |

### Scaling Priorities

1. **First bottleneck:** RSS feed freshness. Current: rebuild required. Fix: Use Astro ISR or serverless function for RSS endpoint.
2. **Second bottleneck:** Build time as content grows. Fix: Parallelize data fetching, cache responses between builds.

## Anti-Patterns

### Anti-Pattern 1: Over-Hydration

**What people do:** Add `client:load` to everything "just in case"

**Why it's wrong:** Defeats the purpose of Astro. Ships unnecessary JS. Slows page load.

**Do this instead:** Default to static (`.astro`). Only add `client:*` when:
- Component has user interaction (click, input, scroll)
- Component uses browser APIs (localStorage, window)
- Component loads external scripts (Google CSE)

### Anti-Pattern 2: Bringing React Patterns to Astro

**What people do:** Try to use React context, global state, useEffect patterns

**Why it's wrong:** These patterns assume a SPA runtime. Astro is fundamentally different.

**Do this instead:**
- Replace context with props passing
- Replace global state with build-time data fetching
- Replace useEffect with Svelte lifecycle or Astro frontmatter

### Anti-Pattern 3: Client-Side Data Fetching for Static Content

**What people do:** Fetch RSS feeds in `onMount` or `useEffect`

**Why it's wrong:** Delays content display, hurts SEO, adds unnecessary JS

**Do this instead:** Fetch in Astro frontmatter at build time:
```astro
---
const posts = await fetchRSSFeeds();
---
<MbfcPosts posts={posts} />
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Custom Search | `client:only="svelte"` component | Loads Google's JS on client only |
| Google Analytics | Inline `<script>` in BaseLayout | No component needed, just HTML |
| RSS Feeds | Build-time `fetch()` in data/rss.ts | Processed at build, not runtime |
| S3/CloudFront | Static deploy | Astro outputs to dist/, sync to S3 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Layout -> Page | `<slot />` injection | Pages provide content to layouts |
| Page -> Component | Props (build-time) | All data flows from frontmatter to components |
| Component -> Component | Props only | No shared state between islands |

## Sources

- Astro Project Structure: https://docs.astro.build/en/basics/project-structure/
- Islands Architecture: https://docs.astro.build/en/concepts/islands/
- Client Directives: https://docs.astro.build/en/reference/directives-reference/
- Svelte Integration: https://docs.astro.build/en/integrations/svelte/
- Content Collections: https://docs.astro.build/en/guides/content-collections/
- Migrating from CRA: https://docs.astro.build/en/guides/migrate-to-astro-from-cra/
- Data Fetching: https://docs.astro.build/en/guides/data-fetching/

---
*Architecture research for: Astro 5 + Svelte 5 Migration*
*Researched: 2026-02-15*
