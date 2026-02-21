---
phase: 03-content-pages
plan: 03
subsystem: Content Infrastructure
tags: [astro-5, content-layer, glob-loader, content-collection]

# Dependency graph
requires:
  - phase: 03-02
    provides: content.config.ts with pages collection, privacy.md, terms.md
provides:
  - src/content.config.ts: Content Layer configuration with explicit glob loader
  - src/pages/privacy.astro: Updated entry ID matching for glob loader compatibility
  - src/pages/terms.astro: Updated entry ID matching for glob loader compatibility
affects: []

# Tech tracking
tech-stack:
  added:
    - astro/loaders: glob loader for Content Layer API
  patterns:
    - Content collections with explicit glob loader using astro/loaders
    - Entry ID matching accepts both 'id' and 'id.md' formats

key-files:
  created: []
  modified:
    - src/content.config.ts: Added glob loader import and loader property
    - src/pages/privacy.astro: Updated entry ID matching to accept both formats
    - src/pages/terms.astro: Updated entry ID matching to accept both formats

key-decisions:
  - "Glob loader entry ID format: Astro 5 glob loader produces entry IDs without file extension, requiring flexible matching in page queries"

patterns-established:
  - "Content Layer API: Use glob() from astro/loaders for explicit content loading"
  - "Entry ID matching: Accept both 'id' and 'id.md' formats for compatibility across loader implementations"

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 03 Plan 03: Content Config Glob Loader Summary

**Astro 5 Content Layer API compliance with explicit glob loader for .md content collection and flexible entry ID matching**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-02-16T11:48:16Z
- **Completed:** 2026-02-16T11:52:31Z
- **Tasks:** 1 of 1
- **Files modified:** 3

## Accomplishments

- Added explicit glob loader from `astro/loaders` to content.config.ts for Astro 5 Content Layer API compliance
- Configured glob loader with pattern `**/*.md` matching actual content files (honors "MD over MDX" decision from 03-02)
- Fixed entry ID matching in privacy.astro and terms.astro to accept both `id` and `id.md` formats
- Build succeeds with 0 errors, all content pages render correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add explicit glob loader to content.config.ts** - `53bd986` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `src/content.config.ts` - Added glob loader import and loader property with .md pattern
- `src/pages/privacy.astro` - Updated entry ID matching to accept both 'privacy' and 'privacy.md'
- `src/pages/terms.astro` - Updated entry ID matching to accept both 'terms' and 'terms.md'

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed entry ID format mismatch with glob loader**
- **Found during:** Task 1 (adding glob loader to content.config.ts)
- **Issue:** Glob loader produces entry IDs without file extension (e.g., 'privacy' instead of 'privacy.md'), causing Privacy and Terms pages to redirect to 404. The pages were looking for 'privacy.md' but the glob loader was returning 'privacy'.
- **Fix:**
  - Updated privacy.astro to accept both 'privacy' and 'privacy.md' as entry IDs
  - Updated terms.astro to accept both 'terms' and 'terms.md' as entry IDs
  - Used flexible matching: `entries.find(e => e.id === 'privacy' || e.id === 'privacy.md')`
- **Files modified:** src/pages/privacy.astro, src/pages/terms.astro
- **Verification:** Build succeeds, Privacy and Terms pages render with correct content
- **Committed in:** `53bd986` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix was necessary for content pages to function with glob loader. The glob loader behavior was expected per Astro 5 docs, but entry ID format required flexible matching.

## Issues Encountered

### Entry ID Format with Glob Loader
- Expected: entry.id === 'privacy.md' (matching the file name with extension)
- Actual: entry.id === 'privacy' (without extension when using glob loader)
- Root cause: Astro 5's glob loader produces entry IDs relative to the base directory without the file extension from the pattern
- Resolution: Updated entry ID matching to accept both formats for robustness

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Content Layer API fully compliant with Astro 5 documented patterns
- Explicit glob loader provides better control over content loading
- Build succeeds with 0 errors
- All content pages (Privacy, Terms) render correctly
- Ready for Phase 04: Interactive Islands (Search and MbfcNews components)

---
*Phase: 03-content-pages*
*Plan: 03*
*Completed: 2026-02-16*
