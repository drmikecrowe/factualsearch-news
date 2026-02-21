# Pitfalls Research

**Domain:** React to Astro 5 + Svelte 5 Migration
**Researched:** 2025-02-15
**Confidence:** MEDIUM (WebSearch-based with official docs verification where available)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major issues.

### Pitfall 1: Analytics Data Gap During Migration

**What goes wrong:**
Google Analytics tracking stops or creates gaps when migrating between tech stacks. The migration window is when tracking is most vulnerable.

**Why it happens:**
- GA tracking code placement differs between React (client-side injected) and Astro (can be server-rendered)
- React Helmet's GA injection doesn't map 1:1 to Astro's head management
- Route changes during migration may not trigger pageview events
- GA4 cookie format changed in May 2025 without notice, affecting continuity

**Consequences:**
- Permanent data gaps in analytics history
- Lost conversion tracking during critical migration period
- Inability to compare pre/post migration performance

**How to avoid:**
1. **Dual-tracking approach**: Run both old and new GA implementations simultaneously during migration
2. **Use GA's Measurement Protocol** as backup for server-side tracking
3. **Verify GA debug mode** works on every migrated page before cutting over
4. **Document your GA property ID** and ensure it's in environment variables (not hardcoded)

**Warning signs:**
- GA Real-Time shows 0 users when you know traffic exists
- Page views drop to zero in GA dashboard during migration window
- Console shows "Google Analytics not defined" or similar errors

**Phase to address:**
Phase 1 (Foundation/Infrastructure) - establish GA continuity before any page migration

---

### Pitfall 2: React Bundle Still Present After "Complete" Migration

**What goes wrong:**
The final bundle still contains React code even after converting all visible components, negating the performance benefits of the migration.

**Why it happens:**
- Hidden dependencies: a utility file imports React but isn't obvious
- Astro's `@astrojs/react` integration left in config
- Components using `client:*` directives that require React hydration
- Third-party libraries have React as peer dependency
- Tree-shaking doesn't remove unused React code from transitive dependencies

**Consequences:**
- Bundle size increases instead of decreases
- Initial page load slower, not faster
- Failed project objective of "eliminating all React from bundle"

**How to avoid:**
1. **Audit dependencies** before migration: `npm ls react react-dom`
2. **Use bundle analysis**: `astro build --analyze` to identify React remnants
3. **Remove `@astrojs/react` from astro.config.mjs** and verify build still works
4. **Search codebase** for all React imports: `grep -r "from 'react'" src/`
5. **Verify no `client:*` directives** remain on any components

**Warning signs:**
- Build output shows React in chunk names
- Network tab shows React being downloaded
- Lighthouse still shows "Reduce JavaScript execution time" warnings

**Phase to address:**
Phase 3 (Component Migration) - verify each page migration removes React dependencies
Final verification in Phase 5 (Cleanup)

---

### Pitfall 3: styled-components Styles Lost During Tailwind Migration

**What goes wrong:**
Visual regressions appear when migrating from styled-components to Tailwind - components look broken or unstyled.

**Why it happens:**
- styled-components' dynamic styles (based on props) don't have direct Tailwind equivalents
- Global styles from styled-components aren't converted
- CSS specificity conflicts between old and new styles
- `@apply` in Tailwind doesn't work as expected with existing CSS
- Class merge conflicts when mixing approaches

**Consequences:**
- Extended QA cycles finding visual bugs
- Production incidents with broken layouts
- Team loses confidence in migration

**How to avoid:**
1. **Incremental migration**: Migrate one component at a time, not entire pages
2. **Use `tailwind-merge` + `clsx`** to handle class conflicts intelligently:
   ```typescript
   import { clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';
   function cn(...inputs) { return twMerge(clsx(inputs)); }
   ```
3. **Create a global Tailwind layer** for base styles before removing styled-components
4. **Visual regression testing** with tools like Percy or Chromatic
5. **Use `prefix: 'tw-'`** in tailwind.config.js if mixing with other CSS frameworks

**Warning signs:**
- Components render without styles after migration
- Layouts shift unexpectedly
- Colors/fonts don't match original design

**Phase to address:**
Phase 2 (Styling Migration) - dedicated phase for CSS conversion

---

### Pitfall 4: SEO Ranking Drop After Removing React Helmet

**What goes wrong:**
Search engine rankings drop significantly after migrating away from React Helmet, even though pages render correctly.

**Why it happens:**
- Meta tags not properly transferred to Astro's `<head>` management
- Missing structured data (JSON-LD) that React Helmet was injecting
- Canonical URLs not set correctly
- Open Graph tags missing, affecting social shares
- robots.txt or sitemap.xml not configured for new structure

**Consequences:**
- Organic traffic drops 20-50%
- Months to recover search rankings
- Social media shares lose preview images

**How to avoid:**
1. **Audit current meta tags**: Document every tag React Helmet injects
2. **Use Astro's `<head>` in layouts**: Create a base layout that handles all meta tags
3. **Implement `@astrojs/sitemap`** for automatic sitemap generation
4. **Test with SEO tools**: Use Screaming Frog or similar to crawl and verify meta tags
5. **Implement structured data**: JSON-LD for articles/products must be ported

**Astro-specific approach:**
```astro
// src/layouts/BaseLayout.astro
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  <!-- JSON-LD structured data -->
  <script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
</head>
```

**Warning signs:**
- Google Search Console shows "Duplicate without user-selected canonical"
- Social shares don't show preview cards
- Pages drop from index or get de-ranked

**Phase to address:**
Phase 1 (Foundation) - verify SEO parity before content migration

---

### Pitfall 5: Svelte 5 Runes Mental Model Mismatch

**What goes wrong:**
Developers with React experience struggle with Svelte 5's runes system, creating buggy reactivity patterns.

**Why it happens:**
- React hooks (`useState`, `useEffect`) work differently from Svelte runes (`$state`, `$effect`)
- React's re-render model vs Svelte's fine-grained reactivity
- `useEffect` dependencies don't map directly to `$effect` tracking
- Runes require different patterns for derived state (`$derived` vs `useMemo`)

**Consequences:**
- Infinite re-renders or stale state bugs
- Performance issues from incorrect reactivity
- Team frustration and slower development velocity
- Code that "works but feels wrong"

**How to avoid:**
1. **Team training first**: Complete Svelte 5 tutorials before starting migration
2. **Reference resources**:
   - Official Svelte 5 tutorials
   - "Component Party" - side-by-side React vs Svelte comparisons
   - Joy of Code's "Svelte 5 Reactivity Guide"
3. **Code review focus**: Extra scrutiny on reactivity patterns
4. **Establish patterns early**: Create reusable state management patterns:
   ```typescript
   // Pattern: Class-based state with runes
   import { FiniteStateMachine, watch, resource } from 'runed';

   export class MyState extends FiniteStateMachine {
     constructor(getter: () => string) {
       super("off", { /* state machine config */ });
       watch(getter, () => { /* side effects */ });
     }
   }
   ```

**Warning signs:**
- Components re-render unexpectedly
- State updates not reflected in UI
- `$effect` running too often or not at all
- Team members confused about which rune to use

**Phase to address:**
Phase 3 (Component Migration) - Svelte-specific training and patterns

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep React for "complex" components | Faster initial migration | Ongoing bundle bloat, dual framework maintenance | Never - plan full migration |
| Use `any` types during migration | Faster TypeScript conversion | Type safety lost, bugs harder to catch | Only with explicit TODO and timeline to fix |
| Inline styles during Tailwind migration | Quicker visual parity | Maintenance nightmare, inconsistent design | Never - use Tailwind from start |
| Skip structured data migration | Faster page migration | SEO penalty, harder to add later | Never - SEO is critical |
| Ignore Google CSE integration | Faster build | Broken search functionality | Never - core feature |
| Deploy without bundle analysis | Faster deployment | Hidden React dependencies | Never - verify before deploy |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Google Analytics** | Hardcoding GA ID in components | Use `import.meta.env.PUBLIC_GA_ID` environment variable |
| **Google CSE** | Loading script in server-rendered component | Use `client:only` directive or load in `<script>` tag with `is:inline` |

| **AWS S3** | Forgetting to set correct MIME types | Use CloudFront for proper content-type headers |
| **RSS Feeds** | Fetching at build time only (stale content) | Consider ISR (Incremental Static Regeneration) or client-side refresh |

### Google CSE Specific Gotcha

Google Custom Search Engine requires client-side JavaScript injection. In Astro:

```astro
---
// Server-side: Render the search container
---
<div id="cse-container"></div>

<script is:inline>
  // Client-side: Load Google CSE
  (function() {
    var cx = 'YOUR_SEARCH_ENGINE_ID';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
  })();
</script>
```

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Build-time RSS fetching | Stale content visible to users | Use ISR or client-side fallback | Immediately (content freshness) |
| Missing image optimization | Slow page loads | Use Astro's `<Image />` component | At 100+ images |
| No caching headers | Slow repeat visits, high CDN costs | Configure CloudFront cache behaviors | At 1K+ daily visitors |
| Unoptimized fonts | Layout shift, slow rendering | Use `@fontsource` or Astro font optimization | At 10K+ daily visitors |

---

## Security Mistakes

Domain-specific security issues for this migration.

| Mistake | Risk | Prevention |
|---------|------|------------|

| **Environment variable exposure** | Secrets leak in bundle | Never use `PUBLIC_` prefix for secrets; verify with `astro build --analyze` |
| **Missing CSP headers** | XSS vulnerability | Configure Content-Security-Policy in CloudFront or Astro |
| **Stale dependencies** | Known CVEs in production | Use `npm audit` in CI, Dependabot for automated updates |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **GA Tracking**: Appears to work but missing custom events - verify all conversion events fire
- [ ] **SEO Meta Tags**: Title/description present but Open Graph missing - test with Facebook/Twitter debuggers
- [ ] **Tailwind Migration**: Visual parity achieved but dark mode broken - test all color modes
- [ ] **RSS Feed**: Renders but API key not properly secured - verify key only in environment variables
- [ ] **TypeScript Strict**: Compiles but `any` types still present - run `tsc --noImplicitAny`
- [ ] **React Removal**: No React imports but `@astrojs/react` still installed - remove from dependencies
- [ ] **S3 Deployment**: Files uploaded but cache headers wrong - verify CloudFront cache behavior
- [ ] **Google CSE**: Search box renders but results don't load - test actual search queries

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Analytics data gap | LOW (data lost forever) | Document gap dates, use backup data sources if available, implement dual-tracking going forward |
| React in bundle | MEDIUM | Full dependency audit, remove all React references, rebuild bundle analysis |
| Styled-components loss | HIGH (visual QA heavy) | Revert to backup, migrate more incrementally, implement visual regression testing |
| SEO ranking drop | HIGH (weeks to months) | Submit updated sitemap, request re-indexing, implement structured data |
| Svelte reactivity bugs | MEDIUM | Code review all reactivity patterns, add unit tests, pair programming |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Analytics data gap | Phase 1: Foundation | GA Real-Time shows data on first migrated page |
| React in bundle | Phase 5: Cleanup | `astro build --analyze` shows no React |
| styled-components loss | Phase 2: Styling | Visual regression tests pass |
| SEO ranking drop | Phase 1: Foundation | Google Search Console shows no errors |
| Svelte reactivity bugs | Phase 3: Components | Unit tests for all reactive components |
| API key exposure | Phase 4: Integrations | No `PUBLIC_` prefix on secrets, bundle analysis clean |
| Google CSE broken | Phase 4: Integrations | Search returns actual results |
| S3 deployment issues | Phase 5: Deployment | Cache headers correct, CDN serves optimized assets |

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Phase 1: Setup** | Environment variables not configured correctly | Document all required env vars before starting |
| **Phase 2: Tailwind** | CSS specificity conflicts | Use `tailwind-merge` from the start |
| **Phase 3: Components** | Svelte runes confusion | Team training before starting phase |
| **Phase 4: Integrations** | API key in client bundle | Always fetch external APIs server-side |
| **Phase 5: Deployment** | Cache headers break updates | Versioned deployments or proper cache invalidation |

---

## Sources

**Migration Experiences:**
- [Lessons from an AI-assisted migration to Astro](https://bennet.org/archive/lessons-from-ai-assisted-migration-to-astro/) - Real-world Hugo to Astro migration experience (Feb 2025)
- [Incremental Migration of a Production React App to Svelte 5](https://sveltejobs.com/blog/incremental-migration-of-a-production-react-app-to-svelte-5) - Detailed React to Svelte migration guide (May 2025)
- [Astro Build Failing? 7 Common Causes](https://eastondev.com/blog/en/posts/dev/20251203-astro-build-failures-guide/) - Comprehensive troubleshooting guide (Dec 2025)

**Svelte 5 Runes:**
- [Svelte 5 Runes vs React Hooks](https://medium.com/@mparundhathi/svelte-5-runes-vs-react-hooks-a-deep-dive-into-modern-reactivity-d866d9e701a9) - React to Svelte mental model comparison (Nov 2025)

**Tailwind Migration:**
- [Debugging Tailwind CSS 4 in 2025](https://medium.com/@sureshdotariya/debugging-tailwind-css-4-in-2025-common-mistakes-and-how-to-fix-them-b022e6cb0a63) - Common Tailwind mistakes (Oct 2025)
- [From Styled Components to Tailwind CSS](https://hackernoon.com/from-styled-components-to-tailwind-css-a-hackernoon-migration-story) - Migration case study (Apr 2025)

**Astro Specific:**
- [Complete Guide to Astro Website SEO](https://eastondev.com/blog/en/posts/dev/20251202-astro-seo-complete-guide/) - SEO implementation guide (Dec 2025)
- [Deploy your Astro Site to AWS](https://docs.astro.build/en/guides/deploy/aws/) - Official AWS deployment documentation

**Security:**
- [API Security Best Practices](https://group107.com/blog/rest-api-security-best-practices/) - 2025 security guidelines

**Official Documentation:**
- [Astro Documentation](https://docs.astro.build/) - Primary reference for all Astro features
- [Svelte 5 Documentation](https://svelte.dev/docs) - Official Svelte 5 runes documentation

---

*Pitfalls research for: React to Astro 5 + Svelte 5 Migration*
*Researched: 2025-02-15*
