# FurFinder — Release Gate

**Status:** Yellow Flag — rounds 97–120 release-readiness work.  
**Last evidence refresh:** 2026-10-31.

## Current decision

**Do not mark Green yet.** The rounds 97–120 branch's exact commit 5c5c29cc87096590845ca274357416fb0318c941 passed CI run #230, but the visible READY Vercel preview points to an earlier SHA. Manual accessibility verification and source terms/access plus moderator decisions also remain outstanding.

## Latest evidence

- PR #19 exact head d630ec828cced62a2c407fa3c71145d391d982f8 passed GitHub Actions run [41166482802](https://github.com/Hanzet22/FurFinder/actions/runs/41166482802), run #228. Dependency installation, npm test and npm run build passed.
- Rounds 97–120 exact branch commit 5c5c29cc87096590845ca274357416fb0318c941 passed GitHub Actions run [41167339037](https://github.com/Hanzet22/FurFinder/actions/runs/41167339037), run #230. Dependency installation, npm test and npm run build passed. A later commit requires fresh CI.
- The visible READY Vercel deployment for this branch is tied to commit 49c716e48283c18bf21476a86b69d4e1e71b9493, not the current branch head. The Vercel status check reports build-rate-limit. Do not retry deployment repeatedly or use the stale preview as release evidence.
- Supabase Security Advisor: 0 lints.
- Supabase Performance Advisor: 2 INFO unused-index notices for existing moderation_events_listing_created_idx and moderation_events_moderator_created_idx. Retain them until workload evidence supports removal.
- VibeRaven 1.7.1 static scan of supabase/proposed/global-directory-expansion.sql: 0 critical, 0 high, 0 warning, 2 INFO rls_no_policies for public.directory_sources and public.listing_sources. These are server-only provenance tables with RLS enabled and no browser policies. Static-only; no SQL execution or live DB/auth test.
- Firecrawl source pilot 7 records organizer-supported dates for Further Confusion 2027, Anthrocon 2027 and Las Vegas Fur Con 2027. Venue is recorded only where supported; all candidates remain pending terms/access review and human moderation.
- Accessibility work remains acceptance documentation; no manual device, screen-reader or WCAG conformance test is claimed.
- Flutter companion remains PRD-only; no mobile app implementation or build is claimed.
- No migration, DDL, production data write, merge, production deployment or listing publication occurred.

## Release states

| State | Meaning | Action |
|---|---|---|
| Green | All applicable evidence is current, exact-head and reviewed; no blocking findings remain. | Eligible for separate release approval only. |
| Yellow | Evidence is partial, stale, rate-limited or awaiting manual review. | Continue bounded work; do not promote or claim launch readiness. |
| Red | Critical/high security issue, privacy breach, broken core flow, failed required test or unapproved mutation. | Stop release work and remediate. |

## Mandatory Green gates

### Repository and CI
- Record candidate PR and exact head SHA.
- Require dependency installation, tests and build to pass for that exact head.
- Any subsequent commit requires a fresh CI result.

### Vercel
- Obtain a READY preview whose Git source SHA exactly matches the candidate head.
- Inspect build output and verify published listing list/detail, bounded filters, cursor pagination, empty/error states and protected moderation access.
- A stale preview or provider rate-limit block keeps the gate Yellow. Do not repeatedly trigger deployments or substitute an older deployment.

### Supabase and VibeRaven
- Review live Security and Performance Advisors; no unresolved critical/high security issue may remain.
- Record all INFO notices and workload rationale.
- Run VibeRaven against the complete proposed SQL and record version, paths and findings.
- Static analysis is not a live database/auth test.
- Proposed SQL outside supabase/migrations/ is not deployed. No DDL or migration without separate explicit approval.

### Accessibility and mobile
- Execute accessibility-acceptance-checklist.md and mobile-ux-acceptance-review.md against the exact preview.
- Record browser/OS, assistive technology/version, viewport, date, result, defect and retest.
- Check keyboard-only operation, focus visibility/restoration, labels and status announcements, 320 CSS-pixel reflow, 200% zoom, reduced motion, contrast and touch targets.
- Do not claim WCAG 2.2 AA conformance from source inspection or a checklist alone.
- Flutter remains PRD-only; it is not a prerequisite to claim web MVP implementation, but no mobile build may be claimed.

### Sources, privacy and publication
- Prefer official organizer sources; aggregators are discovery-only.
- Verify every field independently; a date source does not automatically verify a venue.
- Complete terms/robots/access review and human moderation before listing publication.
- No automatic publication after scraping.
- No attendee/member rosters, private contacts, private messages, precise personal location data or public profiles for minors.
- Public individual profiles, if ever implemented, must be adults-only, voluntary and explicit-consent gated.
- Public URL access is not permission to reuse artwork, logos, photography or event media.

## Stop conditions

Keep Yellow or move Red if exact-head CI fails, the preview is stale, manual tests are incomplete, source rights/consent are unclear, or critical/high findings remain. Never infer live database state from static analysis.

## Approval boundary

This gate does not authorize merge, production deployment, Vercel promotion, rollback, firewall changes, environment-variable mutation, Supabase migration/DDL, production data writes or public listing publication. Each action requires its own explicit approval.
