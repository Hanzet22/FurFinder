# Rounds 143–199 — Technology Expansion Delivery Plan

Date: 2026-10-31  
Base: `d50c3b392b510e7f383879576c4a8cc2dee9ef58`  
Technology register: [144-entry catalogue](technology-expansion-catalogue-143-199.md)

## Goal

Expand the FurFinder web platform and planned Flutter companion with a governed technology portfolio. The catalogue contains 144 entries; this plan stages implementation so the project does not accumulate unnecessary dependencies or expose users to unreviewed services.

## Round map

| Rounds | Workstream | Expected deliverable | Gate |
|---|---|---|---|
| 143–148 | Architecture and inventory | 144-entry catalogue, existing-vs-proposed status, compatibility and risk map | No dependency added without justification |
| 149–154 | Web platform baseline | PWA manifest, safe service-worker shell cache, browser capability boundaries | API and moderator routes never cached |
| 155–160 | Web security baseline | Transport, MIME, referrer, frame and permissions headers | Verify preview response headers; CSP deferred until third-party inventory |
| 161–166 | API contracts | OpenAPI/JSON Schema proposal, generated-type strategy, error envelope | No breaking change to v1 routes |
| 167–172 | Data and search | PostgreSQL FTS/trigram evaluation, index plan and query benchmarks | No production DDL without explicit approval |
| 173–178 | Quality automation | Playwright, axe-core, MSW and Lighthouse CI evaluation/initial tests | No accessibility conformance claim from automation alone |
| 179–184 | Observability | Structured logs, request IDs, Sentry/OpenTelemetry cost and privacy review | No sensitive payloads in telemetry |
| 185–190 | Mobile foundation | Flutter architecture, routing/state/network/local cache prototype plan | Read-only public API; no privileged credentials |
| 191–194 | Mobile quality | Widget/integration testing, offline behavior and deep-link matrix | Device and assistive-tech testing required |
| 195–197 | Discovery interoperability | RSS/Atom/iCalendar/JSON-LD/Schema.org evaluation | Official organizer source remains publication authority |
| 198–199 | Integration and governance | Dependency audit, risk register, test evidence and handoff | Development GREEN; release separately gated |

## First implementation slice

The first runtime slice intentionally uses browser-native capabilities rather than adding a new dependency:

- Web App Manifest for install metadata.
- Service Worker for an offline shell only.
- Static asset cache limited to same-origin, versioned build assets.
- API paths, moderator paths, form mutations and user-specific responses are never cached.
- Network-first navigation with an offline shell fallback.
- Vercel security headers that do not assume a complete Content Security Policy inventory.

## Explicitly not included

- No automatic installation of all 144 technologies.
- No Supabase schema changes, migrations, DDL or production data writes.
- No public source imports or automatic listing publication.
- No public individual profiles, attendee search, private rosters, precise location, direct messaging or adult-content discovery.
- No mobile store submission, production deployment, merge or promotion.
- No Sentry/PostHog/analytics SDK until privacy, retention, consent and cost are reviewed.
- No CSP until all legitimate script/style/image/connect origins have been inventoried and tested.

## Definition of done

A technology is **implemented** only when its code/config exists. It is **tested** only when relevant automated tests pass. It is **preview-verified** only when the exact commit has a matching preview and manual checks are recorded. It is **production-approved** only after explicit release authorization. A catalogue entry alone is not implementation evidence.

## Current state at start

- Existing repository stack confirmed: React, TypeScript, Vite, Tailwind, TanStack Query, Vercel Functions, Supabase/PostgreSQL.
- Flutter is a planned companion, not a built app.
- Supabase Security Advisor currently reports zero lints; Performance Advisor reports two INFO unused-index notices on existing moderation-event indexes.
- No Vercel deployment exists for the Rounds 121–142 development branch.
