---
phase: 01-foundation
plan: "01"
title: "Initialize Astro 5 with Tailwind CSS 4"
subsystem: "Project Foundation"
tags: ["astro", "tailwind", "static", "foundation"]
date: "2026-02-15"
duration: "5 minutes"
completed: true
---

# Phase 1 Plan 1: Initialize Astro 5 with Tailwind CSS 4 Summary

Initialize an Astro 5 project with Tailwind CSS 4 using the @tailwindcss/vite plugin approach (NOT tailwind.config.ts). This establishes the foundation for the factualSearch.news migration.

## One-Liner

Astro 5 with Tailwind CSS 4.1.18 via @tailwindcss/vite plugin, static output mode configured, styled placeholder page demonstrating utility classes.

## Key Outcomes

- Astro 5.17.2 project initialized with static output for S3 deployment
- Tailwind CSS 4.1.18 configured using @tailwindcss/vite plugin (no config file approach)
- Strict TypeScript configuration via Astro's tsconfigs/strict
- Placeholder home page with Tailwind utility classes working
- Old React code backed up to .backup-react/

## Files Created/Modified

### Created
- `astro.config.mjs` - Astro configuration with static output and Tailwind Vite plugin
- `src/env.d.ts` - Astro TypeScript type definitions
- `src/styles/global.css` - Tailwind CSS import with @theme customization
- `src/pages/index.astro` - Styled placeholder home page
- `src/layouts/` - Directory for future layouts
- `.backup-react/` - Backup of original React source code

### Modified
- `package.json` - Replaced React dependencies with Astro and Tailwind CSS 4
- `tsconfig.json` - Updated to extend Astro's strict TypeScript config

### Deleted (old React artifacts)
- `src/app/` - Old React components and pages
- `config/` - Old React webpack/config files
- `src/index.tsx` - Old React entry point

## Tech Stack Added

| Technology | Version | Purpose |
|------------|---------|---------|
| Astro | 5.17.2 | Static site generator |
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |
| @tailwindcss/vite | latest | Vite plugin for Tailwind v4 |

## Technical Decisions

### 1. Tailwind CSS 4 with Vite Plugin
**Decision:** Use @tailwindcss/vite plugin instead of @astrojs/tailwind integration or PostCSS.
**Rationale:** Tailwind v4's native approach uses CSS-based configuration via @theme directive, eliminating need for tailwind.config.ts. Cleaner, more modern.

### 2. Static Output Mode
**Decision:** Configure Astro with output: 'static'
**Rationale:** S3 deployment requires pre-built static HTML. No server-side rendering needed.

### 3. In-Place Migration
**Decision:** Initialize Astro in existing directory, replacing React code.
**Rationale:** Maintains git history, preserves domain structure. Old code backed up to .backup-react/.

## Dependency Graph

### Provides
- Astro build system with static HTML generation
- Tailwind CSS utility classes for component styling
- Foundation for island architecture (Plan 01-02, 01-03)

### Requires
- Node.js 18+ (existing)
- npm (existing)

### Affects
- All subsequent plans depend on this foundation
- Plan 01-02 will add layouts and navigation
- Plan 01-03 will add SEO and metadata

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Replaced entire package.json**
- **Found during:** Task 1
- **Issue:** Existing package.json had React 16 dependencies incompatible with Astro 5
- **Fix:** Created new package.json with Astro 5.17.2 and removed all React dependencies
- **Files modified:** package.json, package-lock.json
- **Commit:** c9618ce

**2. [Rule 3 - Blocking issue] Removed old React source files causing TypeScript errors**
- **Found during:** Task 1 verification
- **Issue:** Old React src/ files caused 466 TypeScript errors during Astro build
- **Fix:** Removed src/app/ and src/index.tsx after backing up to .backup-react/
- **Files modified:** src/app/*, src/index.tsx
- **Commit:** c9618ce

**3. [Rule 3 - Blocking issue] Removed old config directory**
- **Found during:** Task 1
- **Issue:** Old webpack config files caused TypeScript warnings
- **Fix:** Removed config/ directory (React-specific configs not needed for Astro)
- **Files modified:** config/*
- **Commit:** c9618ce

**4. [Rule 1 - Bug] Updated tsconfig.json to exclude old source**
- **Found during:** Task 1
- **Issue:** TypeScript was still scanning old React source files
- **Fix:** Updated tsconfig.json to extend astro/tsconfigs/strict and exclude .backup-react/
- **Files modified:** tsconfig.json
- **Commit:** c9618ce

### Auth Gates
None encountered during this plan.

## Metrics

| Metric | Value |
|--------|-------|
| Duration | 5 minutes (316 seconds) |
| Tasks Completed | 3/3 |
| Commits | 3 (c9618ce, eb26aaf, e14d5b8) |
| Files Created | 6 |
| Files Modified | 3 |
| Files Deleted | 45+ (old React code) |

## Commits

| Hash | Message |
|------|---------|
| c9618ce | feat(01-01): initialize Astro 5 project with static output |
| eb26aaf | feat(01-01): add Tailwind CSS 4 with Vite plugin |
| e14d5b8 | feat(01-01): create styled placeholder home page |

## Verification Checklist

- [x] npm run build succeeds with zero errors
- [x] dist/index.html exists
- [x] dist/_astro/ directory exists with processed CSS
- [x] NO tailwind.config.ts or tailwind.config.js files
- [x] dist/_astro/*.css contains processed Tailwind v4 output (not raw @import directives)
- [x] Page uses Tailwind utility classes (bg-gray-50, text-4xl, etc.)

## Next Steps

Plan 01-02 will:
- Create BaseLayout component
- Add Header and Footer islands
- Implement responsive navigation
- Add viewport and SEO meta tags

## Self-Check: PASSED

All created files exist, all commits verified, build succeeds.
