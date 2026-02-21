# External Integrations

**Analysis Date:** 2026-02-15

## APIs & External Services

**Media Bias/Fact Check:**
- Website: `https://mediabiasfactcheck.com`
  - Used as source for news feed data
  - Embedded in news links

## Data Storage

**Databases:**
- None detected - Static frontend application only

**File Storage:**
- Amazon S3 - Production deployment
  - Bucket: `s3://factualsearch.news`
  - Deploy script: `deploy.sh`
  - Uses AWS credentials managed externally (not tracked in repo)

**Caching:**
- Browser caching only - No server-side caching implemented

## Authentication & Identity

**Auth Provider:**
- None detected - No user authentication system

**Environment:**
- No auth-related environment variables found

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service

**Logs:**
- Console logging only
- Basic error handling with catch blocks

## CI/CD & Deployment

**Hosting:**
- Amazon S3 - Static file hosting
- Deploy script: `deploy.sh`

**CI Pipeline:**
- None detected - Manual deployment via deploy.sh script

## Environment Configuration

**Required env vars:**
- None detected in codebase

**Secrets location:**
- AWS credentials stored in ~/.s3cfg-personal (managed externally)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Analytics

**Google Analytics:**
- Implemented via react-ga
- Tracking ID: UA-131553259-1
- Configuration in `src/app/app.tsx` and `src/app/app.constants.ts`
- Debug mode disabled in production
- Page view tracking on initialization

---

*Integration audit: 2026-02-15*
```