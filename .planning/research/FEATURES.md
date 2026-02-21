# Feature Landscape

**Domain:** Astro 5 + Svelte 5 Static Site Migration
**Researched:** 2026-02-15
**Confidence:** HIGH (based on official docs, community patterns, and codebase analysis)

## Executive Summary

This research covers the feature landscape for migrating a React 16.7 SPA to Astro 5 + Svelte 5. The current site is a content-focused search tool that integrates Google Custom Search Engine (GCSE), displays RSS feeds from Media Bias/Fact Check, lists news sites with bias ratings, and provides informational pages. The migration strategy leverages Astro's islands architecture to convert most content to static HTML while using Svelte islands only for truly interactive components.

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Island Type | Notes |
|---------|--------------|------------|-------------|-------|
| **SEO Meta Tags** | Users expect pages to appear in search results with proper titles/descriptions | Low | Static Astro | Astro has built-in `<title>`, `<meta>` support via Astro.glob or frontmatter. Replace React Helmet with native Astro head management. |
| **Sitemap** | Standard for any indexed website; expected by search engines | Low | Static Astro | Use `@astrojs/sitemap` integration for auto-generation. Configured in `astro.config.mjs`. |
| **Responsive Design** | Mobile-first is baseline expectation | Low | Static Astro | Bootstrap 4 currently used. Can migrate to Tailwind or vanilla CSS. Astro supports any CSS approach. |
| **Page Navigation** | Users expect working links between pages | Low | Static Astro | Astro's file-based routing replaces React Router. All navigation is static HTML. |
| **Privacy Policy Page** | Legal requirement for sites with analytics | Low | Static Astro/MDX | Convert to MDX content collection for easy updates. |
| **Terms of Service Page** | Legal requirement for search services | Low | Static Astro/MDX | Convert to MDX content collection for easy updates. |
| **About Page** | Users expect information about the service | Low | Static Astro/MDX | Current About components can be Astro components with MDX content. |
| **Fast Page Loads** | Core Web Vitals scores affect user retention | Low | Static Astro | Astro's zero-JS-by-default delivers sub-second TTFB naturally. |
| **Accessibility** | WCAG compliance is expected baseline | Medium | Static Astro | Semantic HTML, proper heading structure, ARIA labels. No JS dependency. |

---

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Island Type | Notes |
|---------|-------------------|------------|-------------|-------|
| **Google Custom Search Integration** | Core functionality - enables searching curated news sites | Medium | Svelte Island | GCSE requires script injection at runtime. Wrap in Svelte component with `client:load` directive. The search script must load dynamically. |
| **RSS Feed Display (MbfcNews)** | Shows latest MBFC articles, provides fresh content | Medium | Svelte Island | Uses Svelte 5 runes ($state) for loading/error states. Fetch RSS directly from source feeds. |
| **Site Listing with Bias Ratings (Hosts)** | Unique value - comprehensive database of news sources with ratings | Medium | Svelte Island | Data table with sorting/filtering. Use Svelte for interactivity. Host data can be pre-fetched at build time for initial render. |
| **Bias Definitions Display** | Educational content explaining rating categories | Low | Static Astro | biases.json can be loaded at build time. No interactivity needed. Convert to static content. |
| **Google Analytics with Performance** | Analytics without Core Web Vitals impact | Low | Static Astro + Partytown | Use `@astrojs/partytown` to offload GA to web worker. Better than current react-ga approach. |
| **RSS Feed Generation** | Allow users to subscribe to site updates | Low | Static Astro | Use `@astrojs/rss` to generate feeds for content collections. |
| **Embedded Search Page** | Allow partners to embed search on their sites | Low | Static Astro | EmbeddedPage can be pure static with GCSE island. |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in Astro migrations.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Client-Side Routing (SPA Mode)** | Astro excels at MPA; SPA mode loses SEO benefits and increases JS bundle | Use Astro's native file-based routing with View Transitions for smooth navigation |
| **Full Svelte App Shell** | Defeats Astro's zero-JS purpose; ships unnecessary hydration overhead | Only wrap interactive components as islands; keep layout/navigation as static Astro |
| **React Component Migration** | Mixing React + Svelte adds complexity; Svelte 5 is more performant | Migrate to Svelte 5 components directly; use runes for reactivity |
| **Client-Side Data Fetching for Static Content** | biases.json and hosts.json don't change per-user; client fetch wastes HTTP requests | Use Astro's `getStaticPaths` or content collections to embed data at build time |
| **Over-Hydration** | Hydrating components that don't need interactivity hurts performance | Only use `client:*` directives on components with actual interactivity (search, tables, forms) |
| **Global State Management** | Most content is page-specific; global stores add complexity | Use Astro props for page data; Svelte runes for component-level state only |

---

## Feature Dependencies

```
SEO (meta tags, sitemap)
    └──requires──> Static page structure

Google Analytics (Partytown)
    └──requires──> Astro integration
    └──enhances──> SEO (Core Web Vitals)

GCSE Search Component
    └──requires──> Svelte island (client:load)
    └──requires──> Script injection at runtime

RSS Feed Display (MbfcNews)
    └──requires──> Svelte island (client:visible)

    └──alternative──> Server-side fetch + static render

Site Listing (Hosts)
    └──requires──> Svelte island (client:visible for sorting)
    └──requires──> hosts.json data
    └──alternative──> Static table + client-side progressive enhancement

Bias Definitions (Biases)
    └──requires──> biases.json data
    └──NO HYDRATION NEEDED──> Pure static render

Content Pages (About, Privacy, Terms)
    └──enhances──> SEO (more indexed content)
    └──NO HYDRATION NEEDED──> Static Astro/MDX
```

### Dependency Notes

- **GCSE requires Svelte island with `client:load`:** The Google CSE script must be injected after page load; it's a third-party script that creates a custom element (`<gcse:search>`). This cannot be server-rendered.
- **RSS Feed Display can be hybrid:** Initial render could be server-fetched via Astro endpoint, then Svelte hydrates for any interactivity (refresh, filter). Using `client:visible` defers hydration until scrolled.
- **Hosts table needs Svelte for sorting/filtering:** The `react-strap-table` provides sorting; migrate to Svelte table with runes for local state management. Initial data can be static.
- **Biases requires NO hydration:** The current implementation just displays data; no interactivity. Pure static Astro component.

---

## MVP Recommendation

For MVP (Phase 1), prioritize:

### Launch With (v1)

1. **Static Page Structure** - File-based routing, layout components, navigation (Header/Footer)
   - Why essential: Foundation for all pages; enables SEO

2. **SEO Implementation** - Meta tags, sitemap, robots.txt via Astro
   - Why essential: Table stakes for search visibility; Astro makes this trivial

3. **Content Pages (Home, About, Privacy, Terms, Sites)** - Static Astro/MDX pages
   - Why essential: Core content needs to be accessible

4. **GCSE Search Component** - Svelte island with `client:load`
   - Why essential: Core functionality; the main reason users visit

5. **Google Analytics with Partytown** - Performance-optimized tracking
   - Why essential: User behavior insights; doesn't hurt performance

### Add After Validation (v1.1)

- **RSS Feed Display (MbfcNews)** - Svelte island with `client:visible`
  - Trigger: Users requesting fresh content; validates content engagement

- **Site Listing (Hosts) with Sorting** - Svelte table component
  - Trigger: Users wanting to explore site database

- **RSS Feed Generation** - `@astrojs/rss` for content collections
  - Trigger: Users wanting to subscribe

### Future Consideration (v2+)

- **Client-Side Search Index** - Build-time JSON generation for fast local search
  - Why defer: GCSE already works; local search adds complexity

- **Progressive Web App (PWA)** - Offline capability
  - Why defer: Not core to search functionality; adds build complexity

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Static Page Structure | HIGH | LOW | P1 |
| SEO (Meta Tags, Sitemap) | HIGH | LOW | P1 |
| Content Pages (About, Privacy, Terms) | MEDIUM | LOW | P1 |
| GCSE Search Component | HIGH | MEDIUM | P1 |
| Google Analytics (Partytown) | MEDIUM | LOW | P1 |
| Site Listing (Hosts) | MEDIUM | MEDIUM | P2 |
| RSS Feed Display (MbfcNews) | MEDIUM | MEDIUM | P2 |
| Bias Definitions | LOW | LOW | P2 |
| RSS Feed Generation | LOW | LOW | P3 |
| Client-Side Search Index | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Implementation Strategy: Static vs. Islands

### Static Astro Components (No Hydration)

These components render as pure HTML with zero JavaScript:

1. **Layout** - Header, Footer, main wrapper
2. **Content Pages** - About, Privacy, Terms, embedded page shell
3. **Bias Definitions** - Just displays JSON data
4. **SEO Elements** - Title, meta tags, canonical URLs, JSON-LD
5. **Navigation** - All links and menus

### Svelte Islands (Require Hydration)

These components need client-side JavaScript:

1. **Search Component** - GCSE script injection, search box interaction
   - Directive: `client:load` (immediate hydration, core functionality)
   - Rationale: Search is the primary user action; must work immediately

2. **RSS Feed Display** - Fetches external API, loading states
   - Directive: `client:visible` (hydrate when scrolled into view)
   - Rationale: Below fold; defer hydration for performance

3. **Hosts Table** - Sorting, filtering, pagination
   - Directive: `client:visible` (hydrate when scrolled into view)
   - Rationale: Below fold on Sites page; defer hydration

---

## Migration Mapping: React to Astro/Svelte

| Current React Component | Target Implementation | Reason |
|------------------------|----------------------|--------|
| `app.tsx` (root) | `src/layouts/Layout.astro` | Static layout wrapper |
| `app.router.tsx` | File-based routing in `src/pages/` | Astro handles routing |
| `Header.tsx` | `src/components/Header.astro` | No interactivity needed |
| `Footer.tsx` | `src/components/Footer.astro` | No interactivity needed |
| `Search.tsx` | `src/components/Search.svelte` with `client:load` | GCSE script injection |
| `MbfcNews.tsx` | `src/components/MbfcNews.svelte` with `client:visible` | API fetching, state |
| `MbfcPosts.tsx` | Part of MbfcNews.svelte | Sub-component, no separate hydration |
| `Biases.tsx` | `src/components/Biases.astro` | Static data display |
| `Hosts.tsx` | `src/components/Hosts.svelte` with `client:visible` | Sorting interactivity |
| `Sites.tsx` | `src/pages/sites.astro` | Page composition |
| `HomePage.tsx` | `src/pages/index.astro` | Page composition |
| `AboutPage.tsx` | `src/pages/about.astro` | Static content |
| `PrivacyPage.tsx` | `src/pages/privacy.astro` | Static content |
| `TermsOfServicePage.tsx` | `src/pages/terms.astro` | Static content |
| `EmbeddedPage.tsx` | `src/pages/embed.astro` | Static wrapper + Search island |
| `withTracker.tsx` | Partytown integration | Offload to web worker |

---

## Competitor Feature Analysis

| Feature | Typical News/Search Site | MBFC Current | MBFC Target (Astro) |
|---------|-------------------------|--------------|---------------------|
| Search Integration | Google CSE, Algolia, Elastic | GCSE | GCSE (Svelte island) |
| Content Updates | CMS, RSS, API | RSS via client fetch | Hybrid: static + client refresh |
| Site Directory | Static list, searchable DB | Client-side table | Svelte table with build-time data |
| Analytics | GA, Plausible, Fathom | react-ga | Partytown + GA4 |
| SEO | Meta tags, sitemap, JSON-LD | React Helmet | Native Astro head |
| Performance | Varies widely | React SPA overhead | Zero-JS baseline, islands for interactivity |

---

## Sources

### Official Documentation
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - HIGH confidence
- [Astro Sitemap Integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) - HIGH confidence
- [Astro RSS Package](https://docs.astro.build/en/recipes/rss/) - HIGH confidence
- [Astro Partytown Integration](https://docs.astro.build/en/guides/integrations-guide/partytown/) - HIGH confidence
- [Astro Svelte Integration](https://docs.astro.build/en/guides/integrations-guide/svelte/) - HIGH confidence
- [Sharing State Between Islands](https://docs.astro.build/en/recipes/sharing-state-islands/) - HIGH confidence
- [Server Islands](https://docs.astro.build/en/guides/server-islands/) - HIGH confidence

### Community Resources
- [Astro Islands Architecture Explained (Strapi)](https://strapi.io/blog/astro-islands-architecture-explained-complete-guide) - MEDIUM confidence
- [Pro Google Analytics in Astro with Partytown](https://farrosfr.com/blog/pro-google-analytics-in-astro-with-partytown/) - MEDIUM confidence
- [Fast Client-Side Search for Astro Static Sites](https://evilmartians.com/chronicles/how-to-add-fast-client-side-search-to-astro-static-sites) - MEDIUM confidence
- [SEO Table Stakes (Tech SEO Connect 2025)](https://lilyray.nyc/tech-seo-connect-2025-summary-takeaways/) - MEDIUM confidence

### Codebase Analysis
- Current React components in `/src/app/components/` - HIGH confidence
- Current page structure in `/src/app/pages/` - HIGH confidence
- Data files: `biases.json`, `hosts.json` in `/public/assets/` - HIGH confidence

---

*Feature research for: Astro 5 + Svelte 5 Migration*
*Researched: 2026-02-15*
