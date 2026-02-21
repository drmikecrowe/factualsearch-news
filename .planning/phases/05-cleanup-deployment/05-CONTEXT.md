# Phase 5: Cleanup & Deployment - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

## Phase Boundary

Production-ready bundle with zero React dependencies. Code quality cleanup (console.log removal, TypeScript strict mode) and bundle verification. S3 deployment configuration is **out of scope** for this phase.

## Implementation Decisions

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

## Specific Ideas

No specific requirements — standard cleanup and verification approaches.

## Deferred Ideas

- S3 deployment workflow configuration — future phase
- CloudFront/CDN cache strategy — future phase
- CI/CD pipeline setup — future phase

---

*Phase: 05-cleanup-deployment*
*Context gathered: 2026-02-16*
