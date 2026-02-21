# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- PascalCase for components (e.g., `Header.tsx`, `Search.tsx`)
- MixedCase with CamelCase for files under pages (e.g., `HomePage.tsx`, `AboutPage.tsx`)
- kebab-case for CSS/SCSS files (e.g., `Header.scss`, `Search.scss`)
- Separate `__tests__` directory for test files adjacent to implementation

**Functions:**
- Arrow functions for functional components: `export const Header: React.SFC<IHeaderProps> = (props: IHeaderProps) =>`
- Class methods use standard ES5 syntax: `initReactGA = () => {}`
- Private methods use underscore prefix: `gcseTag(): any`

**Variables:**
- camelCase for all variables (e.g., `reactGaInitialised`, `configs`)
- PascalCase for React component interfaces (e.g., `IHeaderProps`, `ISearchProps`)
- UPPER_SNAKE_CASE for constants and environment variables (e.g., `GOOGLE_ANALYTICS`, `CUSTOM_SEARCH_ENGINE`)

**Types:**
- PascalCase for TypeScript interfaces and types (e.g., `IAppState`, `ISearchState`)
- `any` used when specific types aren't defined

## Code Style

**Formatting:**
- ESLint via `eslint-config-react-app` (inherited from react-scripts)
- TypeScript compiler with strict mode enabled
- Semicolons used consistently
- Curly braces used for blocks even in single-line statements

**Linting:**
- TSLint configured (though ESLint may be preferred in newer React setups)
- TSLint React plugin configured for React-specific rules
- No explicit Prettier configuration detected

## Import Organization

**Order:**
1. React imports: `import * as React from "react";`
2. Third-party library imports: `import ReactGA from "react-ga";`
3. Local file imports: `import { Header } from "./components/Header/Header";`
4. Asset imports: `import "./app.scss";`
5. Constant imports: `import { GOOGLE_ANALYTICS } from "./app.constants";`

**Path Aliases:**
- Configured in Jest for better imports:
  - `^Components$`: `<rootDir>/src/app/components/`
  - `^Hocs$`: `<rootDir>/src/app/hocs/`
  - `^Pages$`: `<rootDir>/src/app/pages/`

## Error Handling

**Patterns:**
- Minimal error handling observed in components
- Most components render without explicit error boundaries
- Error handling mainly concentrated in lifecycle methods (e.g., GA initialization)
- No global error handling strategy detected

## Logging

**Framework:** Console logging
- No logging framework detected in use
- Components primarily rely on React rendering and debugging
- Google Analytics used for tracking user interactions

## Comments

**When to Comment:**
- JSDoc-style comments for component descriptions (e.g., `/** Header Component */`)
- Minimal inline comments except for complex logic
- No comment standards enforced

**JSDoc/TSDoc:**
- Component-level documentation but not method-level
- No strict TSDoc compliance detected

## Function Design

**Size:**
- Functional components kept small and focused
- Class methods generally follow single responsibility principle
- No extremely large functions detected

**Parameters:**
- Optional props interfaces with empty objects as defaults
- No prop validation patterns detected

**Return Values:**
- Explicit return statements in render methods
- JSX returned directly in components

## Module Design

**Exports:**
- Default exports for pages and some components
- Named exports for most components (e.g., `export const Header`)
- Mixed patterns for components and pages

**Barrel Files:**
- No barrel files detected
- Individual file imports used throughout

---

*Convention analysis: 2026-02-15*