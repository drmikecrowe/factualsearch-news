# Testing Patterns

**Analysis Date:** 2026-02-15

## Test Framework

**Runner:**
- Jest 23.6.0
- Configured through package.json jest section
- TypeScript via ts-jest

**Assertion Library:**
- Jest built-in assertions
- No additional assertion libraries detected

**Run Commands:**
```bash
npm test              # Run all tests via react-scripts test
# No watch command configured
# Coverage command: built-in with coverageDirectory: "./dist/coverage"
```

## Test File Organization

**Location:**
- Co-located test files in `__tests__` directories adjacent to components
- Template test files in `config/generators/` for scaffolding

**Naming:**
- ComponentName.test.tsx for component tests
- Test files placed in parent component directory

**Structure:**
```
src/
├── app/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   └── Header.scss
│   │   └── __tests__/ (for HOCs only)
│   └── pages/
└── hocs/
    └── __tests__/
```

## Test Structure

**Suite Organization:**
```typescript
import * as React from 'react';
import { create } from 'react-test-renderer';
import { Header } from './Header';

test('Header Snapshot', () => {
    const header = create(<Header />).toJSON();
    expect(header).toMatchSnapshot();
});
```

**Patterns:**
- Snapshot testing for visual regression
- No setup/teardown functions detected
- Single test per component file
- No grouping or describe blocks used

## Mocking

**Framework:** Jest built-in mocking

**Patterns:**
- Mock React components through test renderer
- External dependencies like react-ga not mocked in tests
- Inline anonymous functions not mocked

**What to Mock:**
- DOM elements (through react-test-renderer)
- Component output

**What NOT to Mock:**
- CSS imports (mapped to identity-obj-proxy)
- React itself (imported directly)
- Third-party integrations (Google CSE, Analytics)

## Fixtures and Factories

**Test Data:**
- Minimal test data used
- No dedicated fixture files detected
- Props passed directly in test cases (e.g., `<Header />`)

**Location:**
- Test data defined inline within tests
- No centralized test data utilities

## Coverage

**Requirements:** Not explicitly enforced
- Target coverage percentage not configured
- Coverage output directory: `./dist/coverage`

**View Coverage:**
```bash
# Run tests with coverage:
npm test
# Coverage reports generated in ./dist/coverage
```

## Test Types

**Unit Tests:**
- Purpose: Visual component snapshots
- Scope: Component rendering output
- Pattern: Snapshot testing with react-test-renderer

**Integration Tests:**
- Not detected
- No integration test files or utilities

**E2E Tests:**
- Not used
- No Cypress, Playwright, or similar frameworks detected

## Common Patterns

**Async Testing:**
- No async patterns detected in tests
- Components tested are primarily static/functional
- No Promise handling or async operations in tests

**Error Testing:**
- No error state testing detected
- Components tested only in happy path scenarios
- No error boundary tests found

---

*Testing analysis: 2026-02-15*