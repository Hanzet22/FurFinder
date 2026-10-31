# FurFinder — FINDER GLOBAL

A global discovery platform for the furry community.

FurFinder helps people discover furry communities, conventions, artists and creators, organizations, makers, studios, and industry resources across countries and regions.

## Product pillars

- **Communities** — discover public furry communities and their official entry points.
- **Conventions** — find furry conventions, meets, and community events.
- **Artists & Creators** — explore portfolios, makers, studios, and creator profiles.
- **Organizations** — discover associations, groups, and community organizations.
- **Industry** — explore manufacturers, merchandise, production, technology, and services.
- **Knowledge** — access guides, public resources, and community information.

## Principles

1. Source transparency: listings should show where information came from and when it was checked.
2. Verification: distinguish verified, community-submitted, and unverified listings.
3. Privacy: never expose private contact details or precise personal locations by default.
4. Minor safety: public discovery only; no adult-content discovery, solicitation, or unsafe contact flows.
5. Accessibility: responsive layouts, keyboard support, readable contrast, and reduced-motion support.
6. Global access: design for localization, regional discovery, and low-bandwidth devices.

## Current implementation

The responsive web MVP uses Vite, React, and TypeScript, with TanStack Query managing published-directory state and cursor pagination. The public directory client reads through the same-origin GET /api/v1/listings Vercel Function, which applies bounded filters, signed cursors and an explicit response allowlist. Supabase PostgreSQL remains the source of truth; public listing reads use the publishable key and published-row access controls. Vercel Node.js Functions also provide health, protected listing intake and authenticated moderation. The moderation desk at /moderation verifies Supabase Auth sessions server-side, checks a server-only moderator allowlist, and records publish/reject decisions atomically with an audit event. Elevated credentials stay on the server. The XML v1 contract exists; its trusted importer remains planned.

The web client includes a Progressive Web App shell: a web manifest, app icon, production service-worker registration, offline navigation fallback and a narrow static-asset cache. API and moderator routes are excluded from service-worker caching. Baseline Vercel security response headers are configured; a Content Security Policy remains deferred until all legitimate third-party origins are inventoried.

The public list and detail endpoints now have a machine-readable OpenAPI 3.1 contract at [openapi/furfinder-public-v1.json](openapi/furfinder-public-v1.json). The contract documents existing handlers; it does not generate them or establish live endpoint conformance.

## Legal, licensing and source transparency

- [Attributions](ATTRIBUTIONS.md)
- [Legal Notice](LEGAL-NOTICE.md)
- [Licensing Notice](LICENSING-NOTICE.md)
- [Source Code Availability](SOURCE.md)
- [Source Register](SOURCES.md)
- [Global Directory API Implementation](docs/global-directory-api-implementation.md)
- [UI Accessibility Review](docs/ui-accessibility-review.md)

## Development

```bash
npm install
npm test
npm run dev
```

## Project status

- [x] Repository foundation
- [x] Product scope and safety principles
- [x] Responsive discovery UI
- [x] Supabase project and initial directory schema
- [x] Public read-only directory API with RLS and least-privilege grants
- [x] Runtime validation for public listing responses
- [x] TanStack Query cache for published directory data
- [x] Tailwind CSS v4 utility layer integrated with existing CSS
- [x] Node.js API functions for health and moderated listing suggestions
- [x] XML v1 import contract and example
- [x] Supabase Auth sign-in and server-side moderator allowlist
- [x] Pending submission queue and manual moderator review in Supabase Dashboard
- [x] In-app pending review console and atomic moderation audit log
- [x] In-app moderator role-management UI for reviewer access (admin protected)
- [x] Polyglot technology matrix and staged implementation roadmap
- [x] Mobile companion product brief
- [x] Vercel deployment
- [x] Automated request-body unit tests, typecheck, and production build in CI
- [x] Streaming byte limits for listing submissions and moderation review requests
- [x] Directory pagination with a load-more control
- [x] PWA manifest, app icon and privacy-bounded service-worker shell cache (feature branch; exact-head preview/manual verification pending)
- [x] Baseline security response headers (feature branch; preview response verification pending)
- [ ] Trusted XML importer runtime
- [ ] Distributed edge rate limiting, automated end-to-end tests, and full launch review
- [x] Versioned public directory list and detail read APIs with signed keyset cursors (feature branch; release validation remains separate)
- [x] OpenAPI 3.1 contract for public directory v1 (feature branch; handler parity/live verification pending)

## Engineering and governance documentation

- [Technology expansion catalogue — 144 entries](docs/technology-expansion-catalogue-143-199.md)
- [Rounds 143–199 technology delivery plan](docs/rounds-143-199-technology-delivery-plan.md)
- [Rounds 200–250 platform plan](docs/rounds-200-250-platform-plan.md)
- [OpenAPI public directory v1 contract](openapi/furfinder-public-v1.json)
- [PWA and web security implementation](docs/pwa-security-implementation-143-160.md)
- [Execution log, rounds 143–199](docs/rounds-143-199-execution-log.md)
- [Global directory API implementation](docs/global-directory-api-implementation.md)
- [Mobile companion PRD](docs/mobile-app-prd.md)
- [Moderation report workflow v1](docs/moderation-report-workflow.md) — design only; no report endpoint.
- [Moderation report workflow v2](docs/moderation-report-workflow-v2.md) — privacy-minimizing API and triage contract; no endpoint.
- [Trusted XML importer v1 design](docs/trusted-xml-importer-v1-design.md) — implementation-ready design; runtime importer remains planned.
- [Directory discovery UX v2](docs/directory-discovery-ux-v2.md)
- [Mobile companion backlog v2](docs/mobile-companion-backlog-v2.md) — Flutter implementation not started.
- [Quality/security test matrix, rounds 121–142](docs/quality-security-test-matrix-121-142.md) — test plan, not execution evidence.
- [Rounds 121–142 development plan](docs/rounds-121-142-development-plan.md)
- [Execution log, rounds 121–142](docs/rounds-121-142-execution-log.md)
- [Accessibility acceptance checklist](docs/accessibility-acceptance-checklist.md) — manual test plan, not a conformance claim.
- [Source pilot 4](docs/source-pilot-4.md)
- [Source pilot 5](docs/source-pilot-5.md)
- [Source pilot 6](docs/source-pilot-6.md)
- [Source pilot 7](docs/source-pilot-7.md)
- [Yellow Flag release gate](docs/yellow-flag-release-gate.md)
- [Rounds 97–120 release-readiness matrix](docs/release-readiness-matrix-97-120.md)
- [Execution log, rounds 97–120](docs/rounds-97-120-execution-log.md)

## Local environment

Copy .env.example to .env.local for browser settings. Run Vercel Functions locally with vercel dev. Configure VITE_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, and SUPABASE_SECRET_KEY in Vercel before enabling submissions. For moderator access, create a Supabase Auth user and follow docs/moderation.md for the one-time admin bootstrap. Never put a Supabase secret/service-role key in a Vite variable or browser bundle. See docs/submissions.md.
