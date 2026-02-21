# Phase 2: Static Components - Research

**Researched:** 2026-02-15
**Domain:** Astro 5 zero-JS component architecture with static data loading
**Confidence:** HIGH

## Summary

Phase 2 migrates the site's core navigation and data display components from React to Astro as zero-JS static components. The key insight is that Astro components are HTML-only templating components that render on the server and ship no JavaScript by default. The original React components (Header, Footer, Biases, Sites, Hosts) can be directly translated to Astro components with TypeScript interfaces for props, JSON imports for data, and Tailwind v4 utility classes for styling. Data files should be moved from `public/` to `src/data/` for build-time bundling and type safety.

**Primary recommendation:** Create Astro components in `src/components/` with TypeScript Props interfaces, import JSON data from `src/data/` directory (not `public/`), use Astro's `.map()` syntax in component templates for list rendering, and verify zero-JS output with bundle analysis after implementation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.2+ | Static component framework | Zero-JS by default, HTML-only templating |
| TypeScript | 5.8.2+ | Component props typing | Built-in to Astro, type-safe component interfaces |
| Tailwind CSS | 4.1.18+ | Component styling | Replaces SCSS, utility-first approach |
| @tailwindcss/vite | 4.1.18+ | Tailwind Vite plugin | Phase 1 foundation, already configured |

### Data Handling
| Approach | Purpose | Why Standard |
|----------|---------|--------------|
| Import JSON from src/data/ | Build-time data bundling | Processed at build time, zero runtime fetch |
| Public folder static assets | No build processing | Only for assets served as-is |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| src/data/ JSON imports | public/ + fetch() | Runtime fetch adds latency, can't verify at build |
| Astro components | React islands | Unnecessary JS for static content |

**Installation:**
No additional packages needed - all dependencies from Phase 1.

## Architecture Patterns

### Recommended Project Structure
```
src/
+-- components/               # NEW: Static components
|   +-- Header.astro         # Header with navigation
|   +-- Footer.astro         # Footer with links
|   +-- Biases.astro         # Bias ratings display
|   +-- Hosts.astro          # Sites listing component
|   +-- Sites.astro          # Combined Biases + Hosts
+-- data/                    # NEW: Data directory
|   +-- biases.json          # Moved from public/
|   +-- hosts.json           # Moved from public/
+-- layouts/
|   +-- BaseLayout.astro     # Modified to include Header/Footer
```

### Pattern 1: Astro Component with TypeScript Props
**What:** Define TypeScript interface for component props in frontmatter. Astro automatically picks up the `Props` interface.

**When to use:** All components that accept props.

**Example:**
```astro
---
// src/components/Header.astro
interface Props {
  currentPath?: string;
}

const { currentPath = '/' } = Astro.props;

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Sites', href: '/sites' },
];
---

<header class="bg-white shadow-sm">
  <nav class="container mx-auto px-4 py-4">
    <ul class="flex gap-4">
      {navItems.map(item => (
        <li>
          <a href={item.href} class:active={currentPath === item.href}>
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```
// Source: https://docs.astro.build/en/basics/astro-components/

### Pattern 2: JSON Data Import from src/data/
**What:** Import JSON files from `src/data/` at build time. Data is bundled and type-safe.

**When to use:** Static data that doesn't change at runtime.

**Example:**
```astro
---
// src/components/Biases.astro
import biasesData from '../data/biases.json';

// TypeScript infers type from biases.json structure
const biases = Object.entries(biasesData)
  .filter(([key]) => !['satire', 'fake-news', 'conspiracy'].includes(key))
  .map(([, value]) => value);
---

<div class="biases">
  <dl class="grid md:grid-cols-2 gap-4">
    {biases.map(bias => (
      <>
        <dt class="font-semibold">{bias.name}</dt>
        <dd class="text-gray-600">{bias.description}</dd>
      </>
    ))}
  </dl>
</div>
```
// Source: https://docs.astro.build/en/guides/data-fetching/

### Pattern 3: Layout Integration with Header/Footer
**What:** Include Header and Footer in BaseLayout.astro using slots for page-specific content.

**When to use:** All pages to maintain consistent navigation.

**Example:**
```astro
---
// src/layouts/BaseLayout.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <Header currentPath={Astro.url.pathname} />
    <main class="min-h-screen">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```
// Source: https://docs.astro.build/en/basics/layouts/

### Pattern 4: Data Table Display
**What:** Map over JSON data to display as table with Tailwind styling.

**When to use:** Listing hosts data from hosts.json.

**Example:**
```astro
---
// src/components/Hosts.astro
import hostsData from '../data/hosts.json';

interface Host {
  name: string;
  url: string;
  labels: string[];
}

const hosts: Host[] = hostsData.filter((host: Host) =>
  host.labels && host.labels.length > 0
);
---

<div class="hosts">
  <h4 class="text-xl font-semibold mb-4">Sites Available</h4>
  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse">
      <thead>
        <tr class="border-b">
          <th class="text-left py-2 px-4">Site</th>
          <th class="text-left py-2 px-4">Bias</th>
        </tr>
      </thead>
      <tbody>
        {hosts.map(host => (
          <tr class="border-b hover:bg-gray-50">
            <td class="py-2 px-4">
              <a href={host.url} target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                {host.name}
              </a>
            </td>
            <td class="py-2 px-4">
              {host.labels[0]?.replace(/-/g, ' ').replace(/ only/g, '')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```
// Source: https://docs.astro.build/en/basics/astro-components/

### Anti-Patterns to Avoid
- **Importing JSON from public/:** Files in public/ aren't processed at build time. Move to src/data/.
- **Using client-side fetch for static data:** Unnecessary network request, breaks zero-JS goal.
- **React-style state management:** Astro components are static. No useState, useEffect needed.
- **SCSS modules:** Use Tailwind utilities instead of component-scoped SCSS.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON bundling | Custom fetch logic | Astro's native JSON imports | Build-time processing, type-safe |
| Component styling | CSS-in-JS or styled-components | Tailwind utilities | Zero runtime overhead |
| Layout composition | Manual include on every page | Astro layouts with slots | DRY, framework-native |
| Table styling | Custom CSS classes | Tailwind table utilities | Consistent, maintainable |

**Key insight:** Astro's HTML-first component model eliminates the need for client-side rendering, state management, and CSS-in-JS runtimes. Static data should be bundled at build time, not fetched at runtime.

## Common Pitfalls

### Pitfall 1: Data File Location Confusion
**What goes wrong:** Components fail to find JSON data, or data isn't bundled correctly.

**Why it happens:** Placing data files in `public/` instead of `src/data/`. The public folder serves files as-is without build processing.

**How to avoid:**
1. Move `biases.json` and `hosts.json` from `public/assets/` to `src/data/`
2. Import with relative path: `import data from '../data/file.json'`
3. Verify data type inference works with TypeScript

**Warning signs:**
- Import errors during build
- Type inference not working
- 404 errors for data files in browser console

### Pitfall 2: Accidental JavaScript in Static Components
**What goes wrong:** Components ship JavaScript when they should be zero-JS.

**Why it happens:** Using interactive features or client-side directives (`client:*`) unnecessarily.

**How to avoid:**
1. Never use `client:*` directives for static display
2. Use pure HTML/CSS for interactivity (CSS :hover, :focus)
3. Verify with bundle analysis: `npx astro check --bundle-analysis`

**Warning signs:**
- Component renders but has hydration script
- Bundle size larger than expected
- Lighthouse shows "Reduce unused JavaScript"

### Pitfall 3: Navigation Link Active State
**What goes wrong:** Current page indicator doesn't work, or requires client-side JS.

**Why it happens:** Not passing `Astro.url.pathname` to Header component for active state comparison.

**How to avoid:**
1. Pass `currentPath={Astro.url.pathname}` to Header from BaseLayout
2. Use `class:active={condition}` syntax for conditional classes
3. Compare against `href` values for active state

**Warning signs:**
- All nav links look the same
- Active state requires client-side route detection

### Pitfall 4: Lost Data During Migration
**What goes wrong:** Some bias categories or hosts missing from migrated component.

**Why it happens:** Original React component filtered out certain categories (satire, fake-news, conspiracy) but migration misses this logic.

**How to avoid:**
1. Cross-reference original React component filtering logic
2. Verify data counts match: original biases display vs new component
3. Test with sample data to ensure all expected items render

**Warning signs:**
- Visual difference between React and Astro versions
- Missing items in lists/tables

## Code Examples

Verified patterns from official sources:

### Complete Header Component
```astro
---
// src/components/Header.astro
interface Props {
  currentPath?: string;
}

const { currentPath } = Astro.props;

const navItems = [
  { name: 'Home', href: '/home' },
  { name: 'About', href: '/about' },
  { name: 'Embed', href: '/embed' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Sites', href: '/sites' },
];

const isActive = (href: string) => currentPath === href;
---

<header>
  <nav class="navbar-expand-lg navbar-light">
    <a class="navbar-brand" href="/">
      <img
        alt="Factual News Search"
        src="/path-to-logo.png"
      />
    </a>

    <ul class="nav-links">
      {navItems.map((item, index) => (
        <li>
          <a href={item.href} class:list={["nav-link", { active: isActive(item.href) }]}>
            {item.name}
          </a>
          {index < navItems.length - 1 && <span> / </span>}
        </li>
      ))}
    </ul>
  </nav>
</header>
```
// Source: Based on backup React component + Astro patterns

### Complete Footer Component
```astro
---
// src/components/Footer.astro
const year = new Date().getFullYear();

const footerLinks = [
  { name: 'Home', href: '/home' },
  { name: 'About', href: '/about' },
  { name: 'Embed', href: '/embed' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Sites', href: '/sites' },
};
---

<footer class="bg-light fixed-bottom">
  <div class="container-fluid">
    <div class="grid md:grid-cols-3 gap-4">
      <div class="footer-links">
        {footerLinks.map((link, index) => (
          <>
            <a href={link.href} class="text-muted hover:underline">
              {link.name}
            </a>
            {index < footerLinks.length - 1 && <span> / </span>}
          </>
        ))}
      </div>

      <div class="footer-center">
        Factual rankings via
        <a href="https://mediabiasfactcheck.com" target="_blank" rel="noopener">
          Media Bias/Fact Check
        </a>
      </div>

      <div class="footer-right">
        <p class="text-muted">
          &copy; {year}
          <a href="/home">factualsearch.news</a>,
          All Rights Reserved
        </p>
      </div>
    </div>
  </div>
</footer>
```
// Source: Based on backup React component + Astro patterns

### Complete Biases Component
```astro
---
// src/components/Biases.astro
import biasesData from '../data/biases.json';

interface BiasCategory {
  name: string;
  description: string;
  url: string;
}

// Filter out satire, fake-news, conspiracy as per original React component
const biasCategories = Object.entries(biasesData)
  .filter(([key]) => !['satire', 'fake-news', 'conspiracy'].includes(key))
  .map(([, value]) => value as BiasCategory);
---

<div class="biases container mx-auto px-4 py-8">
  <h2 class="text-2xl font-bold mb-6">Media Bias Categories</h2>
  <dl class="grid md:grid-cols-2 gap-6">
    {biasCategories.map(category => (
      <>
        <dt class="font-semibold text-lg">
          {category.name}
        </dt>
        <dd class="text-gray-700">
          {category.description}
        </dd>
      </>
    ))}
  </dl>
</div>
```
// Source: Based on .backup-react/src/app/components/Biases/Biases.tsx

### Complete Hosts Component
```astro
---
// src/components/Hosts.astro
import hostsData from '../data/hosts.json';

interface Host {
  name: string;
  url: string;
  labels: string[];
}

// Filter hosts with labels
const hosts: Host[] = hostsData.filter((host: Host) =>
  host.labels && host.labels.length > 0
);

// Format bias label for display
const formatBiasLabel = (label: string) => {
  return label
    .replace(/-/g, ' ')
    .replace(/ only/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};
---

<div class="hosts container mx-auto px-4 py-8">
  <h4 class="text-xl font-semibold mb-4">Sites Available</h4>

  <div class="overflow-x-auto">
    <table class="min-w-full border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left">Site</th>
          <th class="px-4 py-2 text-left">Bias</th>
        </tr>
      </thead>
      <tbody>
        {hosts.map(host => (
          <tr class="border-t hover:bg-gray-50">
            <td class="px-4 py-2">
              <a
                href={host.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
              >
                {host.name}
              </a>
            </td>
            <td class="px-4 py-2">
              {host.labels[0] && formatBiasLabel(host.labels[0])}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <p class="text-sm text-gray-500 mt-4">
    Total sites: {hosts.length}
  </p>
</div>
```
// Source: Based on .backup-react/src/app/components/Hosts/Hosts.tsx

## State of the Art

| Old Approach (React) | Current Approach (Astro) | When Changed | Impact |
|----------------------|--------------------------|--------------|--------|
| useState for data | Build-time JSON import | N/A (framework difference) | Zero runtime data fetching |
| client-side routing | File-based routing | N/A | No router bundle needed |
| styled-components | Tailwind utilities | Phase 1 | Zero CSS-in-JS runtime |
| React Helmet | Astro layouts | Phase 1 | Server-rendered meta tags |
| Client-side navigation | Native browser navigation | N/A | Instant page loads |

**Deprecated/outdated:**
- react-strap-table: Replaced with native HTML table + Tailwind styling
- lodash for data processing: Use native JavaScript array methods
- SCSS modules: Tailwind utilities replace need for component stylesheets

## Open Questions

1. **Should table pagination be implemented?**
   - What we know: Original React component used react-strap-table with 50 items per page
   - What's unclear: Whether pagination is needed for better UX with large data
   - Recommendation: Implement simple table first, add pagination in Phase 3 if needed (would require client-side JS)

2. **What to do with satire/fake-news/conspiracy categories?**
   - What we know: Original Biases component filtered these out
   - What's unclear: Whether this was intentional or should be changed
   - Recommendation: Keep filtering for consistency with existing site, document in component comments

## Sources

### Primary (HIGH confidence)
- https://docs.astro.build/en/basics/astro-components/ - Astro component fundamentals
- https://docs.astro.build/en/basics/layouts/ - Layout composition patterns
- https://docs.astro.build/en/guides/data-fetching/ - Data loading and JSON imports
- https://docs.astro.build/en/guides/styling/ - Styling with Tailwind
- https://tailwindcss.com/docs/installation/framework-guides/astro - Official Tailwind + Astro guide
- https://docs.astro.build/en/recipes/analyze-bundle-size/ - Bundle analysis verification

### Secondary (MEDIUM confidence)
- https://scottwillsey.com/astro-templates-json/ - JSON data handling patterns
- https://cloudcannon.com/tutorials/astro-beginners-tutorial-series/astro-json-imports/ - JSON import tutorial
- https://www.elian.codes/blog/21-09-25-using-slots-to-build-layouts-in-astro/ - Slot-based layouts
- https://www.cloudcannon.com/tutorials/astro-beginners-tutorial-series/astro-layouts/ - Layout practical guide
- https://dev.to/polliog/astro-in-2026-why-its-beating-nextjs-for-content-sites-and-what-cloudflares-acquisition-means-6kl - Zero-JS architecture explanation

### Tertiary (LOW confidence - verified with official docs)
- Various WebSearch results for 2026 Astro patterns (all verified against official docs above)

### Project-Specific Sources
- .backup-react/src/app/components/Header/Header.tsx - Original Header component
- .backup-react/src/app/components/Footer/Footer.tsx - Original Footer component
- .backup-react/src/app/components/Biases/Biases.tsx - Original Biases component
- .backup-react/src/app/components/Hosts/Hosts.tsx - Original Hosts component
- .backup-react/src/app/components/Sites/Sites.tsx - Original Sites component
- public/assets/biases.json - Bias categories data
- public/assets/hosts.json - Hosts data
- .planning/codebase/ARCHITECTURE.md - System architecture reference
- .planning/phases/01-foundation/01-RESEARCH.md - Phase 1 foundation decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions from Phase 1 foundation, no new dependencies
- Architecture: HIGH - Patterns from official Astro documentation, verified against project needs
- Pitfalls: HIGH - Based on common migration issues, verified with official best practices
- Code examples: HIGH - Based on actual React components being migrated, using verified Astro patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable Astro 5.x, Tailwind 4.x)
