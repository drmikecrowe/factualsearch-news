# Phase 3: Content Pages - Research

**Researched:** 2026-02-15
**Domain:** Astro 5 MDX Content Collections for static page content
**Confidence:** HIGH

## Summary

Phase 3 migrates all content pages from React components to Astro MDX content collections. The work involves setting up Astro's Content Layer API (new in Astro 5), defining Zod schemas for content validation, creating MDX files for each page, and building Astro pages that render the MDX content with proper SEO via BaseLayout.

**Primary recommendation:** Use Astro 5's Content Layer API with `glob()` loader in `src/content.config.ts` (not the legacy `src/content/config.ts`). Create a single "pages" collection for static content (Privacy, Terms) and keep Home/About/Sites as Astro pages that compose components, since they include interactive elements.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @astrojs/mdx | 4.3.13+ | MDX support | Official Astro integration, enables Markdown + components |
| Astro Content Layer | 5.x | Type-safe content | Built into Astro 5, replaces content collections API |
| Zod | Built-in | Schema validation | Astro includes zod, used for content schemas |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/sitemap | 3.7.0+ | SEO sitemap | Already configured in Phase 1 |
| sharp | 0.33+ | Image optimization | When MDX includes images |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Content Collections | Static .astro pages with hardcoded content | No type safety, no schema validation, harder to update content |
| Content Collections | JSON files + imports | No MDX support, no component composition in content |
| glob() loader | file() loader | file() for single files, glob() for collections of files |

**Installation:**
```bash
# Already installed in Phase 1, but if needed:
npx astro add mdx
```

## Architecture Patterns

### Recommended Project Structure
```
src/
+-- content.config.ts          # Content Layer configuration (NEW Astro 5)
+-- pages/
|   +-- index.astro            # Home page (component composition)
|   +-- about.astro            # About page (component composition)
|   +-- sites.astro            # Sites page (component composition)
|   +-- privacy.astro          # Privacy page (MDX content)
|   +-- terms.astro            # Terms page (MDX content)
+-- content/
|   +-- pages/                 # Page content collection
|       +-- privacy.mdx
|       +-- terms.mdx
+-- components/                # Page sections (from Phase 2)
    +-- About/
    |   +-- FightingFakeNews.astro
    |   +-- AboutThisSite.astro
    |   +-- YourFirstSearch.astro
    |   +-- WhyUseThisSearch.astro
    |   +-- HelpUsOut.astro
    +-- Biases/
    |   +-- Biases.astro
    +-- Hosts/
    |   +-- Hosts.astro
```

### Pattern 1: Content Layer Configuration (Astro 5)

**What:** Astro 5 uses `src/content.config.ts` with loaders instead of `src/content/config.ts`. This is the new Content Layer API.

**When to use:** All content collections in Astro 5 projects.

**Example:**
```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.coerce.date().optional(),
  })
});

export const collections = { pages };
```
// Source: https://docs.astro.build/en/guides/content-collections/

### Pattern 2: Rendering MDX Content

**What:** Use `render()` function from 'astro:content' to render MDX entries. Returns `{ Content, headings }` for use in pages.

**When to use:** When rendering MDX content in Astro pages.

**Example:**
```astro
---
// src/pages/privacy.astro
import { getEntry, render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const entry = await getEntry('pages', 'privacy');
const { Content, headings } = await render(entry);
---

<BaseLayout title={entry.data.title} description={entry.data.description}>
  <main>
    <h1>{entry.data.title}</h1>
    <Content />
  </main>
</BaseLayout>
```
// Source: https://docs.astro.build/en/guides/content-collections/

### Pattern 3: Component-Based Pages (Not MDX)

**What:** Pages that compose multiple components (Home, About, Sites) should remain as `.astro` files that import and render components directly, not as MDX content.

**When to use:** When a page needs to compose multiple components, include interactive elements, or has complex layout needs.

**Example:**
```astro
---
// src/pages/about.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import FightingFakeNews from '../components/About/FightingFakeNews.astro';
import AboutThisSite from '../components/About/AboutThisSite.astro';
import YourFirstSearch from '../components/About/YourFirstSearch.astro';
import WhyUseThisSearch from '../components/About/WhyUseThisSearch.astro';
import HelpUsOut from '../components/About/HelpUsOut.astro';
---

<BaseLayout title="About factualSearch.news" description="Learn about our mission to fight misinformation">
  <main>
    <FightingFakeNews />
    <AboutThisSite />
    <YourFirstSearch />
    <WhyUseThisSearch />
    <HelpUsOut />
  </main>
</BaseLayout>
```

### Pattern 4: MDX with Components

**What:** MDX files can import and render Astro components inline. Useful for including interactive elements within content.

**When to use:** When content needs component interactivity mixed with prose.

**Example:**
```mdx
---
title: "Privacy Policy"
description: "How we handle your data"
---

import Callout from '../../components/Callout.astro';

# Privacy Policy

Your privacy is important to us.

<Callout type="info">
  We don't track individual users.
</Callout>

## Data Collection

We collect minimal data...
```

### Anti-Patterns to Avoid
- **Using legacy content/config.ts:** Astro 5 uses content.config.ts with loaders. Old location is ignored.
- **MDX for component-heavy pages:** Home, About, Sites should be .astro files, not MDX.
- **Missing schema validation:** Always define Zod schemas for content collections.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content schema validation | Custom validation | Zod schemas in defineCollection | Type-safe, built-in, catches errors at build |
| MDX rendering | Custom MDX pipeline | @astrojs/mdx + render() | Official integration, optimized, handles edge cases |
| Page routing | Custom router | File-based routing in src/pages/ | Astro convention, automatic, works with sitemap |
| SEO meta tags | Manual meta tags | BaseLayout with props | DRY, consistent, works with sitemap |

**Key insight:** Astro's Content Layer handles all the complexity of content loading, validation, and rendering. Don't build custom solutions when Astro provides first-class support.

## Common Pitfalls

### Pitfall 1: Content Layer API Confusion
**What goes wrong:** Using legacy `src/content/config.ts` instead of `src/content.config.ts` with loaders.

**Why it happens:** Astro 5 changed the content API. Many tutorials still reference the old pattern.

**How to avoid:**
1. Use `src/content.config.ts` (not `src/content/config.ts`)
2. Import loaders from `astro/loaders`
3. Use `defineCollection` with `loader` property

**Warning signs:**
- Collections not found errors
- Schema validation not running
- Build succeeds but content not loaded

### Pitfall 2: Over-MDXing Pages
**What goes wrong:** Converting all pages to MDX when component-based pages are more appropriate.

**Why it happens:** MDX seems like the "content" solution, but not all pages are content-driven.

**How to avoid:**
1. Use MDX for prose-heavy content (Privacy, Terms, Blog posts)
2. Use .astro files for component composition pages (Home, About, Sites)
3. Ask: "Is this page primarily text or primarily components?"

**Warning signs:**
- MDX files with no actual markdown content
- Complex component imports in MDX frontmatter
- Layout logic in MDX files

### Pitfall 3: Missing Page Titles
**What goes wrong:** Pages render but have generic or missing titles/descriptions, hurting SEO.

**Why it happens:** Forgetting to pass title/description to BaseLayout.

**How to avoid:**
1. Always pass title and description to BaseLayout
2. Use content collection schema to enforce these fields
3. Verify with browser tab and social preview tools

**Warning signs:**
- Browser tab shows "Untitled" or default
- Social shares have no preview card
- Google Search Console shows title warnings

### Pitfall 4: Content Not Updating
**What goes wrong:** MDX content changes don't appear after editing.

**Why it happens:** Astro's dev server caches content. Need to restart or touch the page file.

**How to avoid:**
1. Restart dev server after schema changes
2. Edit the .astro page file to trigger HMR
3. Use `astro dev --force` for content-heavy development

**Warning signs:**
- Edits to MDX files not reflected
- Schema changes not taking effect

## Code Examples

Verified patterns from official sources:

### Complete Content Configuration
```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
  }),
});

export const collections = { pages };
```
// Source: https://docs.astro.build/en/guides/content-collections/

### Page Rendering MDX Content
```astro
---
// src/pages/terms.astro
import { getEntry, render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const entry = await getEntry('pages', 'terms');
const { Content } = await render(entry);

if (!entry) {
  return Astro.redirect('/404');
}
---

<BaseLayout title={entry.data.title} description={entry.data.description}>
  <article>
    <Content />
  </article>
</BaseLayout>
```
// Source: https://docs.astro.build/en/guides/content-collections/

### MDX Frontmatter Schema
```mdx
---
title: "Terms of Service"
description: "Terms and conditions for using factualSearch.news"
lastUpdated: 2026-02-15
---

# Terms of Service

Last updated: {new Date(frontmatter.lastUpdated).toLocaleDateString()}

## 1. Acceptance of Terms

By accessing factualSearch.news...
```

### Content Query with Filter
```astro
---
// List all pages in a collection
import { getCollection } from 'astro:content';

const allPages = await getCollection('pages');
const sortedPages = allPages.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---
```
// Source: https://docs.astro.build/en/guides/content-collections/

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| src/content/config.ts | src/content.config.ts | Astro 5.0 (2024) | New Content Layer API with loaders |
| Static content in components | MDX content collections | Astro 2.0+ | Type-safe, validatable content |
| React JSX for content | MDX with Astro components | Migration target | Zero-JS for static content |

**Deprecated/outdated:**
- `src/content/config.ts`: Astro 5 uses `content.config.ts` with loaders at project root
- `defineCollection` without loader: New API requires `loader` property

## Content Migration Mapping

| React Page | Astro Approach | Content Location |
|------------|----------------|------------------|
| HomePage | `.astro` file | `src/pages/index.astro` (composes Search + MbfcNews) |
| AboutPage | `.astro` file | `src/pages/about.astro` (composes 5 About sections) |
| PrivacyPage | MDX content | `src/content/pages/privacy.mdx` |
| TermsOfServicePage | MDX content | `src/content/pages/terms.mdx` |
| SitesPage | `.astro` file | `src/pages/sites.astro` (composes Biases + Hosts) |

**Rationale:**
- **Home/About/Sites:** Component composition, not content-driven. Keep as `.astro` files.
- **Privacy/Terms:** Prose-heavy, content-driven. Use MDX for editability.

## Open Questions

1. **Should About sub-components use MDX or stay as Astro components?**
   - What we know: Current components are pure JSX with styled-components
   - What's unclear: If content editors need to update About section text
   - Recommendation: Keep as `.astro` components initially. Convert to MDX only if content needs frequent non-developer edits.

2. **How to handle styled-components content in migration?**
   - What we know: React components use styled-components
   - What's unclear: If content has complex styling that Tailwind can't replicate
   - Recommendation: Migrate styles to Tailwind classes. Most styled-components become simple utility classes.

## Sources

### Primary (HIGH confidence)
- https://docs.astro.build/en/guides/content-collections/ - Official Content Collections docs
- https://docs.astro.build/en/guides/markdown-content/ - Official MDX integration docs
- https://docs.astro.build/en/reference/modules/astro-content/ - Content API reference

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` - Target stack recommendations
- `.planning/research/ARCHITECTURE.md` - Target architecture patterns
- `.planning/phases/01-foundation/01-RESEARCH.md` - Foundation patterns (BaseLayout, Tailwind)

### Tertiary (LOW confidence)
- React component analysis from codebase (verified by reading source)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Astro 5 content API well-documented
- Architecture: HIGH - Patterns from official Astro documentation
- Pitfalls: MEDIUM - Based on Astro migration experience, some from community patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable framework versions)
