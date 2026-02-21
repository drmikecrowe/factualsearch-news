# Codebase Concerns

**Analysis Date:** 2026-02-15

## Tech Debt

**Outdated React Lifecycle Methods:**
- Issue: Using deprecated `componentWillReceiveProps` lifecycle method
- Files: `src/app/hocs/withTracker.tsx`
- Impact: Will be removed in React 17+, causes warnings in React 16
- Fix approach: Use `getDerivedStateFromProps` or `useEffect` in functional components

**TypeScript Disabled Rules:**
- Issue: Critical TypeScript safety rules disabled in tslint
- Files: `tslint.json`
- Impact: "no-any" disabled allows poor type safety, "interface-over-type-literal" disabled reduces consistency
- Fix approach: Enable "no-any" and "interface-over-type-literal" rules

**Legacy Package Versions:**
- Issue: Dependencies are years old, some with known security issues
- Files: `package.json`
- Impact: React 16.7.0 (2018), node-sass 4.11.0 (2018), jQuery 3.3.1 (2018)
- Fix approach: Plan upgrade strategy for modern React 18+ with hooks, switch to sass compiler

## Known Bugs

**Hardcoded API Key in Code:**
- Symptoms: API key embedded in component source code
- Files: `src/app/components/MbfcNews/MbfcNews.tsx`
- Trigger: Will be exposed in client-side bundle
- Workaround: Move to environment variables, not currently implemented

**Console Logs in Production:**
- Symptoms: console.log statements remain in code
- Files: `src/app/components/MbfcNews/MbfcNews.tsx`
- Trigger: Will be visible in browser console in production
- Workaround: Implement logging framework with environment-based levels

## Security Considerations

**Publicly Exposed API Key:**
- Area: MbfcNews component RSS fetch
- Risk: API key for external service embedded in client code
- Files: `src/app/components/MbfcNews/MbfcNews.tsx`
- Current mitigation: None
- Recommendations: Move to environment variables, implement proper secret management

**External API Dependencies:**
- Area: RSS feed consumption from mediabiasfactcheck.com
- Risk: External API calls without rate limiting
- Files: `src/app/components/MbfcNews/MbfcNews.tsx`
- Current mitigation: None
- Recommendations: Add error handling, implement retry logic with backoff

## Performance Bottlenecks

**Inline SCSS CSS:**
- Problem: CSS files created dynamically via string templates
- Files: Multiple component .scss files not found, suggesting inline styles
- Cause: Node-sass v4 with React create-app pattern
- Improvement path: Upgrade to sass compiler, implement proper CSS architecture

**Static Data Loading:**
- Problem: Bias data loaded from public JSON file
- Files: `public/assets/biases.json`
- Cause: No loading strategy, blocking initial render
- Improvement path: Implement lazy loading with React.lazy and Suspense

## Fragile Areas

**Type Definitions:**
- Component: Page components with `any` types
- Files: `src/app/pages/AboutPage/AboutPage.tsx`, `src/app/components/MbfcNews/MbfcNews.tsx`
- Why fragile: Bypasses TypeScript compiler, allows invalid prop passing
- Safe modification: Define proper TypeScript interfaces
- Test coverage: Present but uses same `any` types

**Class Components:**
- Component: All React components are class-based
- Files: Throughout src directory
- Why fragile: Modern patterns favor hooks for better performance and simpler code
- Safe modification: Convert to functional components incrementally
- Test coverage: Good, but mocking patterns may need updating

## Dependencies at Risk

**node-sass:**
- Risk: EOL version 4.x, builds may fail on newer Node.js
- Impact: Build process fails, no CSS generation
- Migration plan: Upgrade to sass compiler

**React v16:**
- Risk: Missing hooks, modern patterns
- Impact: Cannot use latest React features
- Migration plan: Incremental upgrade to React 18+

## Test Coverage Gaps

**Component Testing:**
- What's not tested: User interaction events (clicks, form inputs)
- Files: All .test.tsx files focus on shallow rendering only
- Risk: Integration issues with event handlers not caught
- Priority: Medium

**API Integration Testing:**
- What's not tested: Fetch API calls and error handling
- Files: `src/app/components/MbfcNews/MbfcNews.tsx`
- Risk: External API changes break functionality silently
- Priority: High

---

*Concerns audit: 2026-02-15*