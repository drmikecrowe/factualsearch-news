# Project Research Summary

**Project:** factualSearch.news - React SPA to Astro 5 + Svelte 5 Migration
**Domain:** Static content site with search integration
**Researched:** 2026-02-15
**Confidence:** HIGH

## Executive Summary

This project migrates a React 16.7 SPA (factualSearch.news) to Astro 5 with Svelte 5 islands. The site is a content-focused news search tool that integrates Google Custom Search Engine (GCSE), displays RSS feeds from Media Bias/Fact Check, and lists news sites with bias ratings. The current React SPA ships unnecessary JavaScript for what is predominantly static content.

The recommended approach uses Astro's islands architecture to deliver zero-JS static HTML by default, with Svelte 5 islands only for truly interactive components (search, RSS feed display). This migration eliminates React's 40KB+ bundle overhead, replaces deprecated styled-components with Tailwind CSS 4, and improves SEO through server-rendered meta tags instead of React Helmet.

Key risks include: analytics data gaps during migration, React remnants remaining in the final bundle, styled-components visual regressions during Tailwind migration, and SEO ranking drops if meta tags are not properly transferred. Each risk has specific mitigation strategies documented in the pitfalls research.

## Key Findings

### Recommended Stack

The migration targets Astro 5.17.2+ as the static site framework with Svelte 5.51.2+ for interactive islands. Tailwind CSS 4.1.18+ replaces styled-components (deprecated in 2025) and Bootstrap 4. Content uses Astro's native Content Collections with MDX support via `@astrojs/mdx`. SEO replaces React Helmet with Astro's native `<head>` management and `@astrojs/seo`.

**Core technologies:**
- **Astro 5.17.2+** — Static site framework — Islands architecture enables zero-JS by default while allowing interactivity where needed
- **Svelte 5.51.2+** — Interactive islands — Smallest runtime (~2KB vs React's 40KB+), runes system provides explicit reactivity
- **Tailwind CSS 4.1.18+** — Styling — Replaces styled-components, 10x faster build times than v3, native Astro 5.2+ support
- **TypeScript 5.x** — Type safety — Already in use, excellent Astro integration
- **@astrojs/mdx** — Content — MDX for static content pages with type-safe content collections

**Explicitly avoided:**
- React 16.7 (bundle bloat, hooks complexity)
- styled-components (deprecated, poor SSR support)
- Bootstrap 4 (conflicts with Tailwind)
- React Helmet (unnecessary with Astro's head management)

### Expected Features

**Must have (table stakes):**
- SEO Meta Tags — Users expect pages to appear in search results with proper titles/descriptions
- Sitemap — Standard for indexed websites, expected by search engines
- Responsive Design — Mobile-first is baseline expectation
- Page Navigation — Working links between pages via file-based routing
- Content Pages (About, Privacy, Terms) — Legal and informational requirements
- Fast Page Loads — Core Web Vitals affect user retention
- Accessibility — WCAG compliance baseline

**Should have (differentiators):**
- Google Custom Search Integration — Core functionality enabling search of curated news sites
- RSS Feed Display (MbfcNews) — Shows latest MBFC articles, provides fresh content
- Site Listing with Bias Ratings (Hosts) — Unique value: comprehensive database of news sources
- Google Analytics with Partytown — Analytics without Core Web Vitals impact

**Defer (v2+):**
- Client-Side Search Index — GCSE already works; local search adds complexity
- Progressive Web App (PWA) — Not core to search functionality

### Architecture Approach

Astro's islands architecture underpins this migration: static HTML with zero JavaScript by default, hydrating only interactive "islands" via Svelte components with `client:*` directives. File-based routing replaces React Router. Build-time data fetching in Astro frontmatter replaces client-side useEffect patterns.

**Major components:**
1. **Static Astro Components** — Layout, Header, Footer, Biases, content pages (no JS shipped)
2. **Search Island (client:load)** — Google CSE wrapper requiring immediate hydration
3. **RSS Feed Island (client:visible)** — MbfcNews component hydrating when scrolled into view
4. **Hosts Table Island (client:visible)** — Sorting/filtering interactivity, deferred hydration
5. **Build-time Data Layer** — RSS fetching, hosts/biases JSON processing in frontmatter

### Critical Pitfalls

1. **Analytics Data Gap During Migration** — Prevent by dual-tracking approach, verify GA debug mode on every migrated page before cutover. Address in Phase 1 (Foundation).

2. **React Bundle Still Present After "Complete" Migration** — Prevent by auditing dependencies (`npm ls react`), using `astro build --analyze`, removing `@astrojs/react` from config. Verify in Phase 5 (Cleanup).

3. **styled-components Styles Lost During Tailwind Migration** — Prevent by incremental migration (one component at a time), use `tailwind-merge` + `clsx`, implement visual regression testing. Address in Phase 2 (Styling).

4. **SEO Ranking Drop After Removing React Helmet** — Prevent by auditing current meta tags, using Astro's `<head>` in layouts, implementing `@astrojs/sitemap`. Address in Phase 1 (Foundation).

5. **Svelte 5 Runes Mental Model Mismatch** — Prevent by team training before starting migration, reference Svelte 5 tutorials and "Component Party" comparisons. Address in Phase 3 (Components).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Infrastructure
**Rationale:** Establish GA continuity and SEO parity before any content migration to prevent data gaps and ranking drops.
**Delivers:** Astro project initialized, BaseLayout with meta tags, analytics integration (Partytown), sitemap generation.
**Addresses:** SEO Meta Tags, Sitemap, Google Analytics with Partytown
**Avoids:** Analytics Data Gap, SEO Ranking Drop

### Phase 2: Styling Migration
**Rationale:** Establish visual foundation before component migration to prevent regressions and rework.
**Delivers:** Tailwind CSS 4 configured, global styles migrated from styled-components, utility patterns established.
**Uses:** Tailwind CSS 4.1.18+, @tailwindcss/vite
**Avoids:** styled-components Styles Lost

### Phase 3: Static Component Migration
**Rationale:** Migrate non-interactive components first (majority of site) to establish patterns and validate architecture.
**Delivers:** Header, Footer, Biases, About sections, Privacy/Terms pages as static Astro components.
**Implements:** Static Astro components architecture
**Avoids:** React Bundle Still Present (early removal of React dependencies)

### Phase 4: Interactive Islands
**Rationale:** Add interactivity only after static foundation is proven, isolating complexity to specific components.
**Delivers:** Search.svelte (client:load), MbfcNews.svelte (client:visible), Hosts.svelte (client:visible), Google CSE integration.
**Uses:** Svelte 5.51.2+, @astrojs/svelte 7.2.5+
**Addresses:** Google Custom Search Integration, RSS Feed Display, Site Listing with Bias Ratings

### Phase 5: Cleanup and Deployment
**Rationale:** Final verification and deployment after all functionality migrated.
**Delivers:** React removal verification, bundle analysis, S3/CloudFront deployment, cache configuration.
**Avoids:** React Bundle Still Present (final verification), S3 deployment issues

### Phase Ordering Rationale

- **Phase 1 first:** Analytics and SEO must be continuous; any gap causes permanent data loss or ranking drops
- **Phase 2 before Phase 3:** Styling foundation prevents visual regressions during component migration
- **Phase 3 before Phase 4:** Static components establish patterns and remove bulk of React dependencies early
- **Phase 4 isolated:** Interactive components are complex; isolating them prevents scope creep
- **Phase 5 last:** Final verification ensures complete React removal before deployment

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** Google CSE integration requires testing `client:only` directive patterns and script injection approach. RSS feed fetching strategy (build-time vs client-side refresh) needs decision.
- **Phase 5:** S3/CloudFront cache configuration for Astro static builds; CloudFront invalidation strategy.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Well-documented Astro setup, Tailwind integration, sitemap generation
- **Phase 2:** Standard Tailwind CSS 4 migration patterns
- **Phase 3:** Straightforward component conversion to .astro files

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Astro docs, Svelte 5 docs, npm version lookups |
| Features | HIGH | Official Astro docs, codebase analysis of existing components |
| Architecture | HIGH | Official Astro docs for islands, directives, content collections |
| Pitfalls | MEDIUM | WebSearch-based with official docs verification; real-world migration experiences from 2025 |

**Overall confidence:** HIGH

### Gaps to Address

- **RSS feed freshness strategy:** Current approach fetches at build time. Decision needed: accept staleness, implement ISR, or add client-side refresh. Handle during Phase 4 planning.

- **Google CSE script injection:** Test `client:only="svelte"` vs `is:inline` script approach. Validate during Phase 4.

## Sources

### Primary (HIGH confidence)
- Astro Official Docs — https://docs.astro.build/ (islands, routing, content collections, integrations)
- Svelte 5 Documentation — https://svelte.dev/docs (runes, migration guide)
- Tailwind CSS Astro Guide — https://tailwindcss.com/docs/installation/framework-guides/astro
- Astro 5.2 Tailwind 4 Support — https://astro.build/blog/astro-520/
- npm registry — Version lookups for all packages

### Secondary (MEDIUM confidence)
- Lessons from an AI-assisted migration to Astro — https://bennet.org/archive/lessons-from-ai-assisted-migration-to-astro/
- Incremental Migration of a Production React App to Svelte 5 — https://sveltejobs.com/blog/incremental-migration-of-a-production-react-app-to-svelte-5
- Astro SEO Complete Guide — https://eastondev.com/blog/en/posts/dev/20251202-astro-seo-complete-guide/
- Svelte 5 Runes vs React Hooks — https://medium.com/@mparundhathi/svelte-5-runes-vs-react-hooks-a-deep-dive-into-modern-reactivity-d866d9e701a9

### Tertiary (LOW confidence)
- styled-components deprecation — https://blogs.utkarshrajput.com/styled-components-fading-out-in-2025
- styled2tailwind tool — https://github.com/Blazity/styled2tailwind (needs validation)

---
*Research completed: 2026-02-15*
*Ready for roadmap: yes*
