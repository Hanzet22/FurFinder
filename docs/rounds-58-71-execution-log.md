# FurFinder — Execution Log, Rounds 58–71

**Project:** [Hanzet22/FurFinder](https://github.com/Hanzet22/FurFinder)  
**Branch:** `feat/global-directory-rounds-16-29`  
**PR:** [#16 — Global directory expansion](https://github.com/Hanzet22/FurFinder/pull/16)  
**Date:** 2026-10-31  
**Scope:** public listing detail read path, accessible web UI, source pilot, and release validation.

## Round register

| Round | Workstream | Outcome |
|---:|---|---|
| 58 | Baseline refresh | Rechecked repository, PR #16, latest branch CI, Supabase live advisors, Vercel deployments and Atlassian access. |
| 59 | Slug validation | Added canonical lower-case slug validation (1–120 characters, hyphen-separated alphanumeric segments). |
| 60 | Detail API | Added `GET /api/v1/listings/{slug}` using exact slug and `status=published` filters. |
| 61 | Response privacy | Reused the explicit public projection; unpublished and missing entries both return 404. |
| 62 | Unit tests | Added valid/invalid slug cases. The first CI attempt exposed a missing test import; corrected it and reran. |
| 63 | Web data layer | Added `fetchListingBySlug` with response-shape validation and a distinct unavailable state. |
| 64 | Detail interaction | Added a native HTML dialog for listing detail, including loading, error and success states. |
| 65 | Accessibility | Added dialog labelling, Escape dismissal, close control and focus-visible treatment. |
| 66 | Responsive UI | Added mobile-aware dialog layout and touch-sized controls; reduced-motion preference is respected. |
| 67 | Mobile App Builder alignment | Updated the Flutter companion PRD to consume the list and detail contracts; no native app is claimed. |
| 68 | Firecrawl source pilot | Verified MYFurCon 2027 on its official organizer site (24–25 Apr, Hotel Armada Petaling Jaya) and Fur-Eh! 2027 on its official site (15–18 Jul, Edmonton; venue unconfirmed). |
| 69 | Source governance | Added source pilot 3 and updated the source register. Aggregator results remain discovery-only; no database import or media reuse. |
| 70 | Supabase / VibeRaven boundary | Rechecked live Supabase advisors. No production schema changes. The previous VibeRaven SQL review remains static-only; no new SQL migration was introduced. |
| 71 | CI and release gate | CI run [41164098929](https://github.com/Hanzet22/FurFinder/actions/runs/41164098929) passed all 45 tests and `npm run build` at PR head `faceeb3`. |

## Code changes

- `api/v1/listings/[slug].ts` — published-only listing detail endpoint.
- `api/_lib/directory.ts` — canonical slug validator.
- `tests/directory-api.test.mjs` — slug validation cases.
- `src/lib/directory.ts` — validated detail API client.
- `src/components/ListingDetailDialog.tsx` — accessible listing detail dialog.
- `src/App.tsx` — detail action on directory cards.
- `src/styles.css` — responsive dialog styling and focus-visible states.

## Source pilot

- [MYFurCon 2027: FurGear](https://myfur.org/) — official homepage publishes 24–25 April 2027 and Hotel Armada Petaling Jaya.
- [Fur-Eh! 2027: FURBALLS](https://fureh.ca/) — official homepage publishes 15–18 July 2027 and Edmonton, Alberta; venue not confirmed on the page checked.
- [FurryCons calendar](https://furrycons.com/calendar/) — discovery-only aggregator.

No convention listing was imported or published. No attendee lists, member rosters, private contacts, private messages or precise personal locations were collected. No logos, photographs or event artwork were copied.

## Validation and remaining gates

| System | Current result |
|---|---|
| GitHub CI | Run [41164098929](https://github.com/Hanzet22/FurFinder/actions/runs/41164098929) completed successfully: 45/45 tests and `npm run build` passed at PR head `faceeb3`. |
| Supabase Security Advisor | 0 lints (live read-only check). |
| Supabase Performance Advisor | 2 INFO unused-index notices on existing moderation-event indexes; retained. |
| VibeRaven | Earlier static review: 0 critical / 0 high / 0 warning / 2 INFO. It is not a live DB test. No SQL changed in this round. |
| Vercel | A prior preview for commit 3edf786 is READY. It predates the detail-dialog UI. Current head has a Vercel status failure pointing to a build-rate-limit page; no deployment matching current head is confirmed. An older ERROR deployment at a23b9 was caused by a historical TypeScript export issue. |
| Atlassian Jira | The connected site is visible, but the Jira project listing returned zero projects. No project or issue created. |
| Atlassian Confluence | The site advertises Confluence access, but the Confluence space API returned 404. No page created. |

## Not done

- No Supabase migration, production schema change, or data import.
- No public adult-profile feature; no public profiles for minors.
- No report endpoint or distributed rate limiter.
- No event metadata join or event lifecycle workflow.
- No Flutter application build.
- No PR merge, production deployment, or Vercel promotion.
- No Jira project or Confluence space creation.

## Next steps

1. Confirm a Vercel preview for the current PR head and exercise list/detail endpoints against controlled published and unpublished fixtures.
2. Add endpoint-level tests for 200, 400, 404, 405, 502 and 503 behavior.
3. Keep report intake blocked until schema, retention, moderation and abuse controls are approved.
4. Provide an existing Jira project key or explicitly approve creating a dedicated FurFinder project.
5. Enable a Confluence space on the connected Atlassian site or provide another Confluence-enabled site and target space.
6. Complete contrast, zoom/reflow and assistive-technology testing before claiming WCAG 2.2 AA conformance.
