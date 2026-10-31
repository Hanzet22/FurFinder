# Rounds 200–250 — Platform productization plan

Date: 2026-10-31  
Starting point: `5aed71a2cdfd6a76087ddbc47a8dc3ae5bed4005` on PR #22  
Working branch: `feat/furfinder-rounds-200-250-platform`

## Goal

Turn the existing public-directory web/PWA foundation into a more testable, documented and mobile-ready product. This is a 51-round roadmap, not a claim that all 51 rounds are already implemented.

## Round map

| Rounds | Workstream | Intended outcome | Release gate |
|---|---|---|---|
| 200–205 | API contract | OpenAPI 3.1 contract for existing list/detail routes; contract regression tests | Match actual handlers and public allowlist |
| 206–211 | Client integration | Typed API boundary, pagination/error behavior review, deep-link contract | No breaking API changes |
| 212–217 | UX/UI | Responsive discovery states, empty/error/stale/offline patterns, keyboard review | Manual browser and keyboard checks |
| 218–223 | Web quality | Browser E2E baseline and accessibility automation evaluation | Automation is not a WCAG conformance claim |
| 224–229 | PWA validation | Cache versioning, update lifecycle and offline privacy tests | API and moderator paths remain excluded |
| 230–235 | Data/search | Search workload benchmark design and reproducible synthetic fixtures | No production DDL or extension changes |
| 236–241 | Observability | Request IDs and privacy-safe telemetry design | Never log tokens, emails, private notes or report bodies |
| 242–246 | Mobile foundation | Flutter read-only app skeleton and public API repository boundary | No privileged credentials or moderator routes |
| 247–250 | Integration/governance | Dependency review, test matrix, risk register and handoff | Development and release gates remain separate |

## First implementation slice in this PR

- Add a machine-readable OpenAPI 3.1.1 contract for the existing public list and detail GET routes.
- Describe the actual filters, pagination envelope, listing public-field allowlist and current error statuses.
- Add dependency-free Node tests that validate the contract shape and ensure moderator/report routes are not accidentally documented as public.
- Keep API contract descriptive: it does not generate handlers, change runtime behavior, or prove live endpoint conformance.

## Safety and architecture boundaries

- Public entities and public-facing resources only.
- No attendee search, private group rosters, private contact details, home addresses, precise personal location, private messages or sensitive personal data.
- No public profiles for minors. Any future individual profile feature must be adults-only, voluntary and explicitly consented.
- No automatic publication from crawled sources; provenance and human moderation remain mandatory.
- No Supabase schema/migration/DDL or production data writes in this slice.
- No production deployment, promotion or merge authorization.

## Definition of done

A round is implemented only when the relevant code/config exists. It is tested only when the relevant automated checks pass. Preview-verified requires an exact-head deployment and recorded manual checks. Production approval remains a separate explicit decision.

## Current implementation status

- Implemented: OpenAPI 3.1.1 contract and regression tests (rounds 200–205).
- Implemented: existing typed directory client and filter-aware cursor pagination reviewed; added explicit offline awareness and retry actions for list and detail failures (rounds 206–217).
- Added: source-level UX contract tests for pagination, abort-signal wiring, offline events, accessible dialog states and retry controls. These are not browser E2E tests.
- Added: service-worker lifecycle contract tests for cache version cleanup, activation, network-first navigation fallback and API/moderator exclusions. These are source-level checks, not browser offline runtime verification.
- Added: Playwright Chromium E2E suite with synthetic fixtures for public listing/detail, offline feedback, retry recovery and an axe scan artifact. The axe scan records findings; it does not claim zero violations or WCAG conformance.
- CI installs Chromium on Ubuntu 24.04 and runs the browser suite after unit tests and build. First attempt failed because Playwright 1.58.2 does not support the runner's Ubuntu 26.04 image; runner is now pinned to Ubuntu 24.04. Current-head CI confirmation is pending.
- Pending: generated API client, manual keyboard/screen-reader checks, browser cache lifecycle/offline runtime tests, Flutter runtime app, telemetry SDK and search benchmark execution.
- Deployment policy: Vercel deployment activity is paused by explicit project instruction until the full implementation and verification gate is complete.
