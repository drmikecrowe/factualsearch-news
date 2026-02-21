# Codebase Structure

**Analysis Date:** 2026-02-15

## Directory Layout

```
[data/mcrowe/Programming/Personal/mbfc/fns/fns-main]/
├── build/                    # Compiled output
├── config/                   # Configuration files
│   └── generators/          # Code generation templates
├── public/                  # Static assets
├── src/                     # Source code
│   └── app/                # Main application
│       ├── app.constants.ts # Application constants
│       ├── app.theme.ts    # Theme configuration
│       ├── components/     # Reusable components
│       ├── hocs/           # Higher-order components
│       └── pages/          # Page components
├── typings/                # TypeScript definitions
└── .planning/             # Planning documents
```

## Directory Purposes

**src/app/**:
- Purpose: Main application directory containing all application code
- Contains: Components, pages, HOCs, app-level configs
- Key files: `app.constants.ts`, `app.theme.ts`, `pages/index.tsx`

**src/app/components/**:
- Purpose: Reusable UI components
- Contains: Search, Header, Footer, MbfcNews, etc.
- Key files: `Search/Search.tsx`, `Header/Header.tsx`

**src/app/pages/**:
- Purpose: Route-specific page components
- Contains: HomePage, AboutPage, SitesPage, etc.
- Key files: `index.tsx` (export loader), page-specific components

**src/app/hocs/**:
- Purpose: Higher-order components for cross-cutting concerns
- Contains: withTracker for analytics
- Key files: `withTracker.tsx`

**config/generators/**:
- Purpose: Code generation templates
- Contains: Plop.js generators for components, pages, HOCs
- Key files: `plopfile.js`, component/page/hoc generators

## Key File Locations

**Entry Points:**
- `/src/app/pages/index.tsx`: Route component exports with dynamic loading
- `/src/app/hocs/withTracker.tsx`: Analytics HOC
- `/src/app/app.constants.ts`: Application-wide constants
- `/src/app/app.theme.ts`: Theme and styled-components setup

**Configuration:**
- `/package.json`: Dependencies and scripts
- `/config/generators/plopfile.js`: Code generation configuration
- Jest config in package.json

**Core Logic:**
- Components in `/src/app/components/`
- Pages in `/src/app/pages/`
- Shared utilities in HOCs

**Testing:**
- Co-located with source files in `__tests__` directories
- Jest configuration in package.json
- Test files follow `[Component].test.tsx` pattern

## Naming Conventions

**Files:**
- PascalCase for components: `Search.tsx`, `HomePage.tsx`
- camelCase for utilities and constants
- kebab-case for styles: `Search.scss`

**Directories:**
- PascalCase for component directories: `Search/`, `Header/`
- camelCase for utility directories: `hocs/`, `pages/`

**Components:**
- Default exports for functional components
- Class components when using state or lifecycle methods
- Interface names prefixed with `I` (e.g., `ISearchProps`)

## Where to Add New Code

**New Feature Page:**
- Primary code: `/src/app/pages/[NewPage]/[NewPage].tsx`
- Tests: `/src/app/pages/[NewPage]/__tests__/[NewPage].test.tsx`
- Update: `/src/app/pages/index.tsx` for dynamic loading

**New Component:**
- Implementation: `/src/app/components/[Component]/[Component].tsx`
- Tests: `/src/app/components/[Component]/__tests__/[Component].test.tsx`
- Styles: `/src/app/components/[Component]/[Component].scss`

**New HOC:**
- Implementation: `/src/app/hocs/[hocName].tsx`
- Tests: `/src/app/hocs/__tests__/[hocName].test.tsx`

**Utilities/Constants:**
- Add to `/src/app/app.constants.ts` for app-wide constants
- Create new file in `/src/app/` for shared utilities

## Special Directories

**__tests__/**:
- Purpose: Test files co-located with source
- Generated: No
- Committed: Yes

**build/**:
- Purpose: Compiled output directory
- Generated: Yes (by build process)
- Committed: No (should be in .gitignore)

**public/**:
- Purpose: Static assets served directly
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-02-15*