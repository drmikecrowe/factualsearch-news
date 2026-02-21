# Technology Stack

**Analysis Date:** 2026-02-15

## Languages

**Primary:**
- TypeScript 3.2.2 - Frontend application code
- JavaScript (ES5 target) - Transpiled output for browsers

**Secondary:**
- SCSS - Styling with node-sass compiler

## Runtime

**Environment:**
- Node.js
- Browser runtime (React DOM)

**Package Manager:**
- npm
- Lockfile: package-lock.json present

## Frameworks

**Core:**
- React 16.7.0 - Main UI framework
- React Router 4.3.1 - Client-side routing
- React Loadable 5.5.0 - Code splitting
- React Helmet 5.2.0 - Document head management

**UI Components:**
- Bootstrap 4.2.1 - CSS framework
- ReactStrap 6.5.0 - React Bootstrap components
- Styled Components 4.1.3 - CSS-in-JS styling

**Testing:**
- Jest 23.6.0 - Test runner
- React Test Renderer 16.7.0 - React component testing

**Build/Dev:**
- React Scripts 2.1.2 - Build tool (Create React App)
- TypeScript 3.2.2 - Type checking
- TSLint 5.12.0 - Linting
- Plop 2.2.0 - Code generation

## Key Dependencies

**Critical:**
- React 16.7.0 - Core UI framework
- React DOM 16.7.0 - DOM rendering
- React Router 4.3.1 - Navigation

**Infrastructure:**
- Lodash 4.17.11 - Utility library
- TypeScript definitions for all core packages

## Configuration

**Environment:**
- React Scripts configuration via package.json scripts
- Browserslist configuration for target browsers
- No .env files detected

**Build:**
- TypeScript configuration in `tsconfig.json`
- Jest configuration in package.json
- Custom plop generators for code generation

## Platform Requirements

**Development:**
- Node.js (version not specified but compatible with React Scripts 2.1.2)
- npm for package management

**Production:**
- Static file deployment to S3
- Browser support: >0.2%, not dead, not IE <= 11, not Opera Mini

---

*Stack analysis: 2026-02-15*
```