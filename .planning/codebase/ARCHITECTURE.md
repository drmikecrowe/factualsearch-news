# Architecture

**Analysis Date:** 2026-02-15

## Pattern Overview

**Overall:** React SPA with Component-Based Architecture

**Key Characteristics:**
- Component-based structure with clear separation of concerns
- Higher-Order Components (HOCs) for cross-cutting concerns
- Dynamic code splitting with react-loadable
- Styled-components for styling with theme support
- Plop.js code generation system

## Layers

**App Layer:**
- Purpose: Application-level configuration and constants
- Location: `/src/app/`
- Contains: Theme definitions, constants, HOCs
- Depends on: React, styled-components, react-ga
- Used by: All pages and components

**Page Layer:**
- Purpose: Route-specific components representing major application sections
- Location: `/src/app/pages/`
- Contains: HomePage, AboutPage, SitesPage, etc.
- Depends on: Components layer, HOCs
- Used by: Route definitions, dynamic imports

**Component Layer:**
- Purpose: Reusable UI components
- Location: `/src/app/components/`
- Contains: Search, Header, Footer, MbfcNews, etc.
- Depends on: App layer constants, external libraries
- Used by: Pages and other components

**Utilities Layer:**
- Purpose: Shared utilities and generators
- Location: `/config/generators/`
- Contains: Plop.js generators for code creation
- Depends on: Node.js, file system
- Used by: Development workflow

## Data Flow

**Navigation Flow:**

1. User clicks link → React Router updates URL
2. Route component loads (via Loadable dynamic import)
3. Component wrapped with withTracker HOC
4. HOC tracks page view in Google Analytics
5. Component renders with props

**Component Rendering:**

1. Parent component renders child component
2. Child component receives props and state
3. Component uses styled-components for styling
4. Component may trigger side effects (API calls, etc.)
5. Component renders JSX output

**State Management:**
- Local component state for interactive elements
- Props drilling for data passing
- No global state management detected
- Constants centralized in app.constants.ts

## Key Abstractions

**withTracker HOC:**
- Purpose: Google Analytics integration for all pages
- Examples: `/src/app/hocs/withTracker.tsx`
- Pattern: Higher-Order Component wrapping route components

**Loadable Components:**
- Purpose: Code splitting and lazy loading
- Examples: `/src/app/pages/index.tsx`
- Pattern: Dynamic imports with loading states

**Styled Components:**
- Purpose: Component styling with theme support
- Examples: `/src/app/app.theme.ts`
- Pattern: CSS-in-JS with theming

**Code Generators:**
- Purpose: Automate component/page/HOC creation
- Examples: `/config/generators/`
- Pattern: Plop.js templates for consistent structure

## Entry Points

**Application Entry:**
- Location: Not explicitly defined (likely public/index.js)
- Triggers: React Scripts build/start
- Responsibilities: Bootstrap React application

**Route Entry Points:**
- Location: `/src/app/pages/index.tsx`
- Triggers: Route navigation
- Responsibilities: Dynamic component loading with tracking

**Component Entry:**
- Location: Individual component files
- Triggers: Parent component rendering
- Responsibilities: Render specific UI elements

## Error Handling

**Strategy:** Basic error handling at component level

**Patterns:**
- Try-catch blocks for component lifecycle
- React error boundaries (not extensively used)
- Graceful loading states with Loadable

## Cross-Cutting Concerns

**Logging:** Google Analytics integration via withTracker HOC
**Validation:** Minimal validation patterns observed
**Authentication:** Not detected in current codebase

---

*Architecture analysis: 2026-02-15*