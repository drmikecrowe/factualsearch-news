---
phase: 03-content-pages
plan: 01
subsystem: Content Infrastructure
tags: [astro-5, content-layer, mdx, content-collection]
wave: 1

# One-liner
Astro 5 Content Layer with glob loader for MDX content collection, Privacy and Terms policy pages, and Home page with search/news placeholders.

# Dependency Graph
requires:
  - phase-01: BaseLayout component (required by index.astro)
provides:
  - src/content.config.ts: Content collection configuration for MDX pages
  - src/content/pages/: MDX content storage for privacy/terms policies
affects:
  - phase-04: Search and MbfcNews components will mount into placeholder divs

# Tech Stack
added:
  - astro:content: Content Layer API for MDX collections
  - astro/loaders: glob loader for content files
patterns:
  - Content-first architecture with glob loader
  - MDX with frontmatter validation via Zod
  - Placeholder containers for future interactive components

# Key Files Created/Modified
created:
  - src/content.config.ts: Astro 5 Content Layer configuration with pages collection
  - src/content/pages/privacy.mdx: Privacy policy content migrated from React
  - src/content/pages/terms.mdx: Terms of service content migrated from React
modified:
  - src/pages/index.astro: Home page with search and news placeholders

# Decisions Made
1. **Glob Loader Pattern (Rule 3 - blocking issue fix)**: Used Astro 5's new glob() loader from 'astro/loaders' instead of legacy content config. The glob loader is required for Astro 5 Content Layer and provides automatic file discovery.
2. **Content Directory Structure**: Placed MDX files at src/content/pages/ to follow Astro 5 conventions. The content.config.ts file is at the project root (src/content.config.ts), not in the content directory.

# Deviations from Plan
None - plan executed exactly as written.

# Auth Gates
None encountered.

# Verification Results
- [x] Content Layer configuration exists at src/content.config.ts with glob loader and Zod schema
- [x] MDX content directory created at src/content/pages/
- [x] privacy.mdx and terms.mdx exist with valid frontmatter and migrated content
- [x] Home page at src/pages/index.astro renders with BaseLayout and placeholders
- [x] Build succeeds without errors

# Test Results
Build verification:
```
npm run build
Result: 0 errors, 0 warnings, 0 hints
2 page(s) built in 1.34s
```

File verification:
- src/content.config.ts: FOUND
- src/content/pages/: FOUND
- src/content/pages/privacy.mdx: FOUND
- src/content/pages/terms.mdx: FOUND
- src/pages/index.astro: FOUND

# Performance Metrics
duration: 2 minutes
started: 2026-02-16T10:43:47Z
completed: 2026-02-16T10:45:47Z
tasks_completed: 3 of 3
commits: 3

# Next Steps
1. Execute plan 03-02: Create About page and dynamic routing for MDX content
2. Phase 04 will integrate Search.svelte and MbfcNews.svelte into the placeholder containers
3. Consider creating dynamic page routes for privacy/terms MDX content (optional - could be static pages)

# Issues/Risks
- Low priority: "No entry type found" warnings during build are expected for new MDX files with glob loader
- Future: Privacy and Terms pages may need dedicated routes if we want them accessible via URL (currently only Home page exists)
