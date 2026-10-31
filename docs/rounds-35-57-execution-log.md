# FurFinder — Execution Log, Rounds 35–57

**Project:** [Hanzet22/FurFinder](https://github.com/Hanzet22/FurFinder)  
**Working branch:** `feat/global-directory-rounds-16-29`  
**Pull request:** [#16 — Global directory expansion](https://github.com/Hanzet22/FurFinder/pull/16)  
**Date:** 2026-10-31  
**Scope:** public global entity directory; source-aware event discovery; future adult opt-in profiles kept separate and not implemented.

## Round register

| Round | Workstream | Outcome |
|---:|---|---|
| 35 | Repository and PR baseline | Reconfirmed PR #16 is open and Draft; branch head started from the existing global-directory work. |
| 36 | Supabase documentation review | Consulted current Supabase API documentation for PostgREST filtering and boolean logic before composing query filters. |
| 37 | API query model | Added a dedicated directory query helper with category, region, country, search and page-size validation. |
| 38 | Request bounds | Enforced a maximum search length and a page limit of 1–50 (default 20). |
| 39 | Cursor integrity | Added versioned HMAC-SHA-256 signed keyset cursors; malformed or altered cursors are rejected. |
| 40 | Public read endpoint | Added `GET /api/v1/listings` with published-only filtering and an explicit column selection. |
| 41 | Response minimization | Added upstream row validation and an explicit public response projection. |
| 42 | Web data layer | Replaced direct browser-to-Supabase listing reads with the same-origin versioned API client. |
| 43 | Infinite pagination | Switched the web directory to server-issued cursors through TanStack Query. |
| 44 | Filter state | Added search/category/region to the query key so filter changes restart pagination. |
| 45 | Unit-test coverage | Added tests for filters, cursor signing/tampering, 24-hour expiry, malformed cursor payloads and response-field minimization. CI run 41159346825 passed all 37 tests (37/37) and `npm run build` at code commit 05ed5f1. |
| 46 | API documentation | Added `docs/global-directory-api-implementation.md` and updated the API contract status. |
| 47 | Firecrawl discovery | Rechecked the public FurryCons 2027 calendar as an aggregator-only discovery source; no source pages were bulk-crawled. |
| 48 | Source provenance | Retained organizer verification as the publication gate; aggregator entries remain candidates, not official confirmation. |
| 49 | Privacy boundary | Reconfirmed that no attendee lists, private rosters, private contacts, private messages or precise personal location data are collected. |
| 50 | UI/UX alignment | Kept the existing mobile-first directory structure and trust labels; added a keyboard skip link and standardized 44px minimum touch targets without changing the visual identity. |
| 51 | Accessibility | Added a source-level accessibility review. Focus visibility, reduced motion, status roles and responsive states are present; contrast measurement, zoom/reflow and assistive-technology testing remain open. |
| 52 | Mobile App Builder alignment | Kept the Flutter companion as a future API consumer; no native app build or store release is claimed. |
| 53 | VibeRaven review | Static SQL review: 0 critical, 0 high, 0 warning, 2 INFO findings for server-only source/provenance tables with RLS and no browser policies. |
| 54 | Supabase live review | Security Advisor: 0 lints. Performance Advisor: 2 INFO unused-index notices on existing moderation-event indexes; no index removed. |
| 55 | Atlassian documentation | Confluence space listing returned 404 (site reports Confluence unavailable); Jira project search for “FurFinder” returned 0 projects. No page, project or issue was created. Atlassian documentation is blocked pending a Confluence-enabled site or an explicitly selected Jira project. |
| 56 | GitHub synchronization | API, client, tests and documentation were committed to the existing feature branch and PR #16. |
| 57 | Release gate | No merge, production migration, bulk import or deployment promotion. CI run 41159212428 passed all tests/build at current head 0974300; a fresh preview and external review remain required. |

## Implementation details

### New files

- `api/_lib/directory.ts` — validated filters, signed cursor encoding/decoding, public record validation and response projection.
- `api/v1/listings.ts` — public published-listing endpoint.
- `tests/directory-api.test.mjs` — focused unit tests.
- `docs/global-directory-api-implementation.md` — route behavior, configuration, limitations and verification status.
- `docs/ui-accessibility-review.md` — targeted source-level UI review and remaining WCAG checks.

### Updated files

- `src/lib/directory.ts` — same-origin API client and response validation.
- `src/App.tsx` — cursor-based infinite query and server-side filter parameters.

### Deliberately not shipped

- No `POST /api/v1/reports` route: the production database has no approved report table, retention policy or report moderation flow.
- No profile endpoints or profile table: eligibility and consent workflows are not implemented.
- No event metadata migration: the proposed SQL remains a proposal.
- No distributed rate limiter: request bounds and upstream timeouts are not equivalent to distributed abuse protection.
- No new Supabase production objects or data imports.
- No new Atlassian project or Confluence space.

## Current verification

| System | Result |
|---|---|
| GitHub | PR #16 remains the review boundary; merge is not performed. |
| Supabase Security Advisor | 0 lints (live, read-only check). |
| Supabase Performance Advisor | 2 INFO unused-index notices on existing moderation-event indexes. |
| VibeRaven 1.7.1 | Static review only: 0 critical / 0 high / 0 warning / 2 INFO. |
| Firecrawl | Public aggregator discovery only; no bulk crawl or ingestion. |
| Atlassian | Confluence unavailable on the connected site; no matching Jira project. |
| CI / Vercel | A current-head workflow run and fresh preview must be confirmed before release claims. |

## Next gates

1. Run the repository test and build workflows against the latest PR head.
2. Fix any compile, test or CI failures and re-run the static review as needed.
3. Validate the deployed preview against the same commit SHA.
4. Review API pagination against a controlled non-production dataset, including duplicate timestamps and cursor tampering.
5. Add distributed rate limiting before broad public exposure.
6. Design the report workflow and schema before adding report submission.
7. Obtain a Confluence-enabled Atlassian site or an explicitly selected Jira project, then mirror this execution log there.
8. Keep all migrations, bulk ingestion, PR merge and production promotion behind separate approval.
