# Roadmap: factualSearch.news Migration

## Overview

Migration of factualSearch.news from React 16.7 SPA to Astro 5 with Svelte 5 islands. The journey establishes foundation infrastructure first (analytics, SEO, styling), migrates static components, adds content pages via MDX, implements interactive Svelte islands for search and RSS feeds, then finalizes with bundle cleanup and S3 deployment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Astro 5 project with Tailwind, layout, GA tracking, and sitemap
- [ ] **Phase 2: Static Components** - Header, Footer, Biases, Sites components as Astro
- [ ] **Phase 3: Content Pages** - Home, About, Privacy, Terms, Sites as MDX content
- [ ] **Phase 4: Interactive Islands** - Search and RSS feed Svelte components with env vars
- [ ] **Phase 5: Cleanup & Deployment** - React removal, TypeScript fixes, bundle verification, S3 deploy

## Phase Details

### Phase 1: Foundation
**Goal**: Project infrastructure ready with continuous GA tracking and SEO parity before any content migration
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05
**Success Criteria** (what must be TRUE):
  1. User can load the site and see a properly styled page with Tailwind CSS
  2. User's page visits are tracked in Google Analytics (verified via GA debug mode)
  3. Search engines can discover the site via sitemap.xml
  4. Each page has proper meta tags (title, description) visible in browser and search results
  5. Site builds successfully to static HTML with `astro build`
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Initialize Astro 5 project with Tailwind CSS 4 via @tailwindcss/vite
- [ ] 01-02-PLAN.md — Create BaseLayout with head management and inline GA integration
- [ ] 01-03-PLAN.md — Configure @astrojs/sitemap for automatic sitemap generation

### Phase 2: Static Components
**Goal**: Core navigation and data display components migrated as zero-JS Astro components
**Depends on**: Phase 1
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04
**Success Criteria** (what must be TRUE):
  1. User sees consistent header with navigation links on every page
  2. User sees footer with links on every page
  3. User can view bias ratings data displayed from biases.json
  4. User can view site listing with hosts data
  5. No JavaScript is shipped for these components (verified via bundle analysis)
**Plans**: 2 plans

Plans:
- [ ] 02-01: Create Header and Footer Astro components
- [ ] 02-02: Create Biases and Sites Astro components with data display

### Phase 3: Content Pages
**Goal**: All content pages available with proper routing and SEO (MD for prose, Astro for component pages)
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. User can navigate to Home page and see search interface placeholder
  2. User can read About page with section components rendered
  3. User can read Privacy Policy page content rendered from MD
  4. User can read Terms of Service page content rendered from MD
  5. User can view Sites listing page with Biases and Hosts components
**Plans**: 3 plans (2 execution + 1 gap closure)

Plans:
- [x] 03-01-PLAN.md — Set up MD content collection and Home page
- [x] 03-02-PLAN.md — Create About, Privacy, Terms, and Sites content pages
- [ ] 03-03-PLAN.md — [GAP CLOSURE] Add explicit glob loader to content.config.ts

### Phase 4: Interactive Islands
**Goal**: Search and RSS feed functionality restored via Svelte 5 islands with secure API key management
**Depends on**: Phase 3
**Requirements**: ISLE-01, ISLE-02, ISLE-03, SEC-01
**Success Criteria** (what must be TRUE):
  1. User can search curated news sources via Google CSE integration
  2. User can view latest MBFC news articles fetched from RSS feed
  3. User can view latest MBFC posts fetched from RSS feed
  4. RSS API key is loaded from environment variables (not hardcoded)
  5. Interactive components hydrate only when needed (client:load for search, client:visible for feeds)
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Create Search.svelte island with Google CSE integration
- [ ] 04-02-PLAN.md — Create MbfcNews.svelte and MbfcPosts.svelte with env-based API key

### Phase 5: Cleanup & Deployment
**Goal**: Production-ready bundle with zero React dependencies verified via bundle analysis
**Depends on**: Phase 4
**Requirements**: SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. No console.log statements appear in browser console during normal usage
  2. TypeScript compiles with zero `any` types (strict mode passes)
  3. Bundle analysis confirms zero React dependencies in output
  4. Build completes successfully with static output
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Verify no console.log, add svelte-check, confirm TypeScript strict mode
- [ ] 05-02-PLAN.md — Add bundle analysis tooling and verify zero React in output

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Static Components | 0/2 | Not started | - |
| 3. Content Pages | 0/2 | Not started | - |
| 4. Interactive Islands | 0/2 | Not started | - |
| 5. Cleanup & Deployment | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-15*
*Depth: standard*
*Coverage: 22/22 requirements mapped*
