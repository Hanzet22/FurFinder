# FurFinder — Yellow Flag Release Gate

**Status:** active caution state for rounds 94–96.  
**Purpose:** prevent passing checks, stale previews or design-only documents from being mistaken for release approval.

## Current state

**Yellow Flag — proceed with bounded review and documentation; do not release.**

Evidence checked on 2026-10-31:
- GitHub Actions run [41165828287](https://github.com/Hanzet22/FurFinder/actions/runs/41165828287), run #226, completed successfully for PR #18 head `b5a98f78fd90be211354bdc1931db4af9d1a5d4c`. Dependency installation, tests and production build all passed. This is not validation of the newer rounds 94–96 branch.
- Vercel inventory still shows the latest visible READY preview on old commit `a87cf69f621f82d3d6dfad0691a0a9c48323e9e0`, not the rounds 94–96 branch. No current-head preview validation is claimed. Earlier deployment attempts were blocked by the free daily deployment cap; do not repeatedly retry.
- Supabase Security Advisor: 0 lints.
- Supabase Performance Advisor: 2 INFO unused-index notices for existing moderation-event indexes. Retain pending workload evidence; do not drop indexes solely from this notice.
- VibeRaven 1.7.1 static review of the complete `supabase/proposed/global-directory-expansion.sql`: 0 critical, 0 high, 0 warning, 2 INFO `rls_no_policies` notices for the server-only provenance tables. Static analysis only; it did not execute SQL or inspect live authorization.
- Round 94 verified Anthro Northwest 9 dates and venue from official organizer pages, and NordicFuzzCon dates/locality from its official homepage. NordicFuzzCon venue remains unconfirmed. Both candidates remain pending and unpublished.
- Round 95 added a written UX/accessibility acceptance review. No manual device, screen-reader or WCAG conformance audit is claimed.
- Flutter remains PRD-only; no mobile implementation is claimed.
- No production migration, DDL, data write, deployment promotion, rollback or merge occurred.

## State definitions

| State | Meaning | Required action |
|---|---|---|
| Green | All required evidence is current, complete and reviewed; no blocking findings remain. | Eligible for a separate release approval. |
| Yellow | Evidence is partial, stale, rate-limited, or contains non-blocking findings needing review. | Continue bounded work; do not promote or claim launch readiness. |
| Red | A critical/high security issue, privacy breach, broken core flow, failed required test, or unapproved data mutation is found. | Stop release work; contain and remediate before resuming. |

## Mandatory gates

### 1. Repository and CI
- Record exact PR head SHA and workflow run.
- Require dependency install, tests and build to complete successfully.
- Re-run after any code change that affects behavior.
- A green CI result does not override a failed or stale provider check.

### 2. Vercel preview
- Preview must reference the exact PR head SHA.
- Confirm READY state and inspect build output.
- Verify protected preview access and critical read-only user flows.
- If provider rate limits prevent a current-head preview, keep Yellow; do not repeatedly trigger builds or promote an older deployment as a substitute.

### 3. Supabase
- Run live Security and Performance Advisors after schema-affecting work.
- Review every finding and distinguish INFO from blocking findings.
- Confirm migrations and data changes are separately approved.
- Never expose service-role/secret keys in browser code.
- Proposed SQL outside `supabase/migrations/` is not a deployed schema change.

### 4. VibeRaven
- Record exact version, input paths and finding counts.
- Static findings are repository-text analysis, not a live database/authentication test.
- Server-only tables with RLS and no browser policies may be intentional; document the access boundary rather than adding broad policies.
- A clear static report is not proof that production is secure.

### 5. Accessibility and UX
- Complete the manual checklist in [accessibility-acceptance-checklist.md](accessibility-acceptance-checklist.md).
- Execute [mobile UX acceptance review](mobile-ux-acceptance-review.md) against the exact candidate build.
- Test keyboard operation, focus behavior, labels, validation announcements, contrast, 200% zoom, narrow reflow, reduced motion and touch targets.
- Run assistive-technology checks on supported platforms and record versions, date, defects and retest evidence.
- Do not claim WCAG 2.2 AA conformance from source inspection or a checklist alone.

### 6. Mobile companion
- The Flutter companion remains a PRD, not a built or tested application.
- Keep its first release read-only until API contracts, privacy controls and parity checks are approved.
- No attendee/member discovery, private messaging, precise personal location, or public profiles for minors.
- Do not create a second data ingestion path from the mobile client.

### 7. Source governance
- Official organizer pages are preferred for event dates and status.
- Verify fields independently; a date source does not automatically verify a venue.
- Aggregators are discovery-only.
- No auto-publication after scraping; moderation review remains mandatory.
- No private rosters, attendee lists, private contacts or personal location data.

## Stop conditions

Keep Yellow or move to Red when:
- The preview does not match the current PR head.
- A required build/test fails or has not completed.
- Live database state is assumed from static analysis.
- A privacy, consent, licensing or minor-safety boundary is unclear.
- A schema/data mutation or production action lacks explicit approval.
- An unresolved high/critical issue affects security or core functionality.

## Approval boundary

This document defines a gate; it does not authorize merge, migration, production deployment, Vercel promotion, firewall changes, or public listing publication. Each action requires its own explicit approval after the evidence is current.
