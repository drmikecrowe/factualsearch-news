# Requirements: factualSearch.news Migration

**Defined:** 2026-02-15
**Core Value:** Feature parity with better performance and maintainability — same search experience and content, delivered faster with modern tooling.

## v1 Requirements

### Foundation

- [ ] **FND-01**: Astro 5 project initialized with static output
- [ ] **FND-02**: Tailwind CSS 4 configured with @tailwindcss/vite
- [ ] **FND-03**: BaseLayout with head management (replaces React Helmet)
- [ ] **FND-04**: Google Analytics integration with continuous tracking
- [ ] **FND-05**: Sitemap generation via @astrojs/sitemap

### Content Pages (MDX)

- [ ] **CONT-01**: Home page with search integration
- [ ] **CONT-02**: About page as MDX content
- [ ] **CONT-03**: Privacy page as MDX content
- [ ] **CONT-04**: TermsOfService page as MDX content
- [ ] **CONT-05**: Sites page as MDX content

### Static Components (Astro)

- [ ] **STAT-01**: Header component with navigation
- [ ] **STAT-02**: Footer component with links
- [ ] **STAT-03**: Biases component displaying biases.json
- [ ] **STAT-04**: Sites component displaying hosts data

### Interactive Components (Svelte Islands)

- [ ] **ISLE-01**: Search.svelte with Google CSE integration (`client:load`)
- [ ] **ISLE-02**: MbfcNews.svelte with client-side RSS fetching (`client:visible`)
- [ ] **ISLE-03**: MbfcPosts.svelte with client-side RSS fetching (`client:visible`)

### Security & Quality

- [ ] **SEC-01**: RSS API key moved to environment variables
- [ ] **SEC-02**: Remove all console.log statements
- [ ] **SEC-03**: Proper TypeScript (no `any` types)
- [ ] **SEC-04**: Remove all React dependencies from bundle

### Deployment

- [ ] **DEP-01**: S3 static deployment workflow configured
- [ ] **DEP-02**: Bundle analysis confirms zero React in output

## v2 Requirements

Deferred to future release.

- **NOTF-01**: PWA support with offline capability
- **SRCH-01**: Client-side search index (replace GCSE dependency)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Embedded page | Instruction page for embedding search — removed as low-value feature |
| Server-side rendering | S3 static hosting only, no server |
| Authentication | Not present in current system, not needed |
| Database | Entirely static site |
| React dependencies | Explicitly eliminated from production bundle |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| STAT-01 | Phase 2 | Pending |
| STAT-02 | Phase 2 | Pending |
| STAT-03 | Phase 2 | Pending |
| STAT-04 | Phase 2 | Pending |
| ISLE-01 | Phase 4 | Pending |
| ISLE-02 | Phase 4 | Pending |
| ISLE-03 | Phase 4 | Pending |
| SEC-01 | Phase 4 | Pending |
| SEC-02 | Phase 5 | Pending |
| SEC-03 | Phase 5 | Pending |
| SEC-04 | Phase 5 | Pending |
| DEP-01 | Phase 5 | Pending |
| DEP-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after initial definition*
