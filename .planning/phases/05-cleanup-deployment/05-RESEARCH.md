# Phase 5: Cleanup & Deployment - Research

**Researched:** 2026-02-16
**Domain:** Astro build verification, TypeScript strict mode, bundle analysis
**Confidence:** HIGH

## Summary

This phase focuses on code quality cleanup and build verification to ensure production readiness. The primary concern is verifying that the migration from React to Astro+Svelte is complete, with zero React dependencies remaining in the final bundle. The codebase is already in good shape: TypeScript strict mode is configured, no console.log statements exist in authored code, and no `any` types are present.

**Primary recommendation:** Add `rollup-plugin-visualizer` for bundle analysis, verify `svelte-check` for Svelte component type safety, and use `astro check && astro build` as the final build command to catch TypeScript errors before deployment.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
None - All implementation decisions are at Claude's discretion

### Claude's Discretion

**Console.log policy:**
- Remove all `console.log` statements from authored code
- Preserve `console.error` and `console.warn` for legitimate error/warning cases
- Leave third-party library logs untouched (not our code)

**TypeScript strictness:**
- Fix all `any` types with proper type definitions where the type is known
- Use `unknown` with type guards for truly dynamic data
- Use `@ts-expect-error` comments only for documented third-party limitations
- Enable strict mode in tsconfig.json

**Bundle analysis:**
- Use `astro build` output analysis to verify no React dependencies
- Report bundle sizes for main JavaScript chunks
- No specific size thresholds — focus on React removal verification

**Deployment:**
- **OUT OF SCOPE** — Defer to future phase or manual setup

### Deferred Ideas (OUT OF SCOPE)
- S3 deployment workflow configuration — future phase
- CloudFront/CDN cache strategy — future phase
- CI/CD pipeline setup — future phase

</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.2 | Static site generator | Current stable, built-in TypeScript support |
| TypeScript | 5.8.2 | Type safety | Latest stable, strict mode via Astro presets |
| @astrojs/check | 0.9.4 | Type checking Astro components | Official Astro type checker |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rollup-plugin-visualizer | latest | Bundle analysis | For verifying React removal and bundle composition |
| svelte-check | latest | Svelte component type checking | For type safety in Svelte islands |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| rollup-plugin-visualizer | @rollup/plugin-analyze | Visualizer provides HTML visualization, analyze provides JSON only |
| astro check | tsc | `astro check` handles .astro files; `tsc` ignores them |

**Installation:**
```bash
npm install --save-dev rollup-plugin-visualizer svelte-check
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # Astro components (server-rendered)
│   └── islands/         # Svelte interactive components
├── layouts/             # Layout templates
├── pages/               # Route pages
├── styles/              # Global styles
└── env.d.ts             # Global type declarations
```

### Pattern 1: TypeScript Strict Mode Configuration
**What:** Using Astro's strict TypeScript preset for maximum type safety
**When to use:** All new Astro projects; already configured in this project
**Example:**
```typescript
// Source: https://docs.astro.build/en/guides/typescript/
{
  "extends": "astro/tsconfigs/strict",
  "exclude": ["node_modules", "dist", ".backup-react"]
}
```

### Pattern 2: Type-Safe Error Handling
**What:** Using proper type guards with `unknown` instead of `any`
**When to use:** Handling errors or dynamic data from external APIs
**Example:**
```typescript
// Source: TypeScript best practices 2025-2026
try {
  const data = await fetchRSS();
} catch (e) {
  if (e instanceof Error && e.name !== 'AbortError') {
    // Properly typed error handling
    console.error('RSS fetch error:', e);
  }
}
```

### Pattern 3: Bundle Analysis with rollup-plugin-visualizer
**What:** Visualizing bundle composition to verify dependency removal
**When to use:** Before deployment to verify React has been removed
**Example:**
```javascript
// Source: https://docs.astro.build/en/recipes/analyze-bundle-size/
import { defineConfig } from 'astro/config';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        emitFile: true,
        filename: "stats.html",
      })
    ]
  }
});
```

### Anti-Patterns to Avoid
- **Using `any` for "temporary" types**: This spreads through the codebase; use `unknown` with type guards instead
- **Silencing TypeScript errors with `@ts-ignore`: Use `@ts-expect-error` with documented reasons only
- **Removing console.error statements**: Keep these for legitimate error reporting; only remove console.log

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bundle analysis | Custom build script parsing | `rollup-plugin-visualizer` | Provides comprehensive visualization, handles all edge cases |
| TypeScript checking | Custom tsc wrappers | `astro check && svelte-check` | Official tools handle Astro and Svelte files correctly |
| Console detection | Regex replacement | Manual review + grep | Safer; automated tools can't distinguish legitimate vs debug logging |

**Key insight:** The official Astro and Svelte tooling already handles type checking and build verification. Custom solutions are unnecessary and error-prone.

## Common Pitfalls

### Pitfall 1: Incomplete Type Checking
**What goes wrong:** Running `tsc` directly ignores `.astro` files, missing type errors
**Why it happens:** `tsc` doesn't understand Astro's component syntax
**How to avoid:** Always use `astro check` for type verification; use `svelte-check` for Svelte components
**Warning signs:** Build passes but TypeScript errors appear in editor

### Pitfall 2: React Dependencies in Bundle
**What goes wrong:** React code accidentally bundled despite migration
**Why it happens:** Third-party packages may depend on React, or old code paths remain
**How to avoid:** Use `rollup-plugin-visualizer` to inspect final bundle; search package.json dependencies
**Warning signs:** Large bundle sizes, "react" appears in bundle visualization

### Pitfall 3: Overzealous Console Removal
**What goes wrong:** Removing legitimate error logging along with debug statements
**Why it happens:** Automated tools can't distinguish between error reporting and debug output
**How to avoid:** Preserve `console.error` and `console.warn`; only remove `console.log`
**Warning signs:** Production errors become harder to diagnose

### Pitfall 4: False Sense of Type Safety
**What goes wrong:** TypeScript strict mode enabled but `any` types still present
**Why it happens:** `any` bypasses all type checking, even in strict mode
**How to avoid:** Search for `: any` patterns and replace with proper types or `unknown`
**Warning signs:** Editor shows "any" type annotations

## Code Examples

Verified patterns from official sources:

### Build Script with Type Checking
```typescript
// Source: https://docs.astro.build/en/guides/typescript/
// package.json
{
  "scripts": {
    "build": "astro check && astro build",
    "check": "astro check && svelte-check"
  }
}
```

### Svelte Component with Proper Types
```svelte
<script lang="ts">
  // Use explicit interface for props
  interface Rss2JsonResponse {
    status: string;
    feed?: any;  // Replace with proper type when known
    items?: RssItem[];
  }

  interface RssItem {
    title: string;
    link: string;
    pubDate: string;
  }

  // Use unknown for truly dynamic data
  let data: unknown = null;

  // Type guard before using
  if (isRssResponse(data)) {
    posts = data.items;
  }
</script>
```

### Type Guard Pattern
```typescript
// Source: TypeScript best practices 2025-2026
function isRssResponse(data: unknown): data is Rss2JsonResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    (data as Rss2JsonResponse).status === 'ok'
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tsc` for type checking | `astro check` | Astro v1+ | Proper `.astro` file type checking |
| Manual bundle inspection | `rollup-plugin-visualizer` | 2020+ | Easy bundle composition visualization |
| `any` for dynamic data | `unknown` with type guards | TypeScript 3.0+ | Maintains type safety with dynamic data |

**Deprecated/outdated:**
- **Using `@ts-ignore`**: Replace with `@ts-expect-error` and document why
- **Manual console.log removal**: Use proper logging practices from the start
- **Relying on `tsc` for Astro projects**: Use `astro check` instead

## Open Questions

1. **Svelte component type checking**
   - What we know: `svelte-check` is the standard tool
   - What's unclear: Integration with existing `astro check` workflow
   - Recommendation: Add `svelte-check` to check script; run after `astro check`

2. **Third-party type definitions**
   - What we know: Some RSS2JSON types may use `any`
   - What's unclear: Whether proper types exist for this API
   - Recommendation: Define local interfaces if no proper types available

## Sources

### Primary (HIGH confidence)
- [Astro TypeScript Guide](https://docs.astro.build/en/guides/typescript/) - TSConfig presets, type checking, astro check command
- [Astro Bundle Analysis Recipe](https://docs.astro.build/en/recipes/analyze-bundle-size/) - rollup-plugin-visualizer setup and usage
- [TypeScript strict mode documentation](https://www.typescriptlang.org/tsconfig/strict.html) - Official strict mode behavior

### Secondary (MEDIUM confidence)
- [How to Configure TypeScript Strict Mode - OneUptime](https://oneuptime.com/blog/post/2026-01-24-typescript-strict-mode/view) - January 24, 2026
- [Let's Be Real: It's Time to Ditch `any` for `unknown` in TypeScript](https://dev.to/trivedivatsal/lets-be-real-its-time-to-ditch-any-for-unknown-in-typescript-2cn4) - September 22, 2025
- [Why 'unknown' is Better Than 'any': A TypeScript Safety Guide](https://medium.com/@ignatovich.dm/why-unknown-is-better-than-a-typescript-safety-guide-073be8c301e0) - April 14, 2025
- [ESLint no-console rule](https://eslint.org/docs/latest/rules/no-console) - Console statement detection

### Tertiary (LOW confidence)
- Reddit discussions on console.log removal approaches - Community patterns
- Various blog posts on TypeScript best practices - General guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Astro documentation verified
- Architecture: HIGH - Current project configuration matches best practices
- Pitfalls: HIGH - Common TypeScript/Astro issues documented
- Bundle analysis: HIGH - Official Astro recipe provided

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - Astro ecosystem is stable)

## Current State Assessment

Based on codebase inspection during research:

- **TypeScript strict mode:** ✅ Already configured via `"extends": "astro/tsconfigs/strict"`
- **console.log statements:** ✅ None found in authored code
- **console.error statements:** ✅ Present and appropriate for error handling (MbfcPosts.svelte, MbfcNews.svelte)
- **React dependencies:** ✅ None in package.json
- **Any types:** ✅ None detected in source files

The project is already in excellent shape for this phase. Primary work will be:
1. Add bundle analysis tooling
2. Verify no React in final bundle
3. Ensure type checking workflow is complete (add svelte-check)
4. Document bundle sizes
