# factualSearch.news Migration

## What This Is

Migration of factualSearch.news from React 16.7 SPA to Astro 5 with MDX content pages and Svelte 5 islands for interactive components. The site provides a curated Google Custom Search Engine for factual news sources, RSS feed displays from Media Bias/Fact Check, and static content pages.

Target architecture eliminates React entirely from the production bundle, replacing it with static-first Astro pages and lightweight Svelte islands only where interactivity is required.

## Core Value

Feature parity with better performance and maintainability — same search experience and content, delivered faster with modern tooling.

## Requirements

### Validated

Existing capabilities preserved from current codebase:

- ✓ Google Custom Search Engine integration (cx: 011275290256739755566:cwfn9qhuqkk) — existing
- ✓ Google Analytics tracking (UA-131553259-1) via withTracker HOC — existing

- ✓ Static biases.json data display (Biases component) — existing
- ✓ Site listing page (Sites component with hosts data) — existing
- ✓ Content pages: Home, About, Privacy, TermsOfService — existing
- ✓ S3 static deployment — existing

### Active

Migration goals:

- [ ] Astro 5 project with static output configured
- [ ] MDX content collection for About, Privacy, Terms, Sites pages
- [ ] Svelte 5 islands for MbfcNews, MbfcPosts, Search, Header, Footer
- [ ] Tailwind CSS replacing styled-components and Bootstrap
- [ ] RSS API key moved to environment variables
- [ ] Remove all React dependencies from production bundle
- [ ] Remove console.log statements
- [ ] Proper TypeScript (no `any` types)
- [ ] SEO via Astro (replace React Helmet)
- [ ] Continuous GA tracking during migration
- [ ] S3 deployment workflow (user will provide technique)

### Out of Scope

- Embedded page — instruction page for embedding search on other sites; removed as feature
- Server-side rendering — S3 static only
- Authentication — not present in current system
- Database — entirely static site
- React dependencies — explicitly eliminated

## Context

**Current Architecture:**
- React 16.7 SPA with 45 TS files (~1,185 lines)
- Component-based structure with HOCs for cross-cutting concerns
- react-loadable for code splitting
- styled-components with Bootstrap 4
- React Router for client-side routing
- React Helmet for SEO

**Existing Data Sources:**
- biases.json — static JSON file with bias ratings

- Google CSE — search functionality
- Google Analytics — usage tracking

**Technical Debt to Address:**
- Hardcoded API key in MbfcNews.tsx
- console.log statements throughout
- `any` type usage in TypeScript
- Outdated dependencies (React 16, TSLint deprecated)

## Constraints

- **Deployment:** S3 static hosting — user will apply preferred deployment technique from other projects
- **Analytics:** GA tracking must remain continuous (no data gaps during migration)
- **Bundle:** No React dependencies in final output
- **Domain:** Keep existing domain/routing (factualsearch.news, s3://factualsearch.news)
- **Search:** Google CSE integration preserved with same cx ID

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Svelte 5 over React islands | Lightweight, modern, no React in bundle | — Pending |
| MDX for content pages | Authoring experience, Astro native | — Pending |
| Tailwind CSS | Drop styled-components, utility-first, smaller bundle | — Pending |

| Remove Embedded page | Low-value feature, simplifies scope | — Pending |
| S3 deployment (user's technique) | User has preferred approach from other projects | — Pending |

---
*Last updated: 2026-02-15 after initialization*
