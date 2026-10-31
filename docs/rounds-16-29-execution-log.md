# Development Log — Rounds 16–29

**Project:** Hanzet22/FurFinder  
**Working branch:** feat/global-directory-rounds-16-29  
**Base:** feat/api-hardening-bounded-body  
**Scope:** A — public global entities/events; B — adult opt-in individual profiles.

## Round plan

| Round | Focus | Deliverable / gate |
|---|---|---|
| 16 | Re-inspect integrations and repo state | Confirmed repo, PR, Supabase, Vercel, Firecrawl and Atlassian access |
| 17 | Global source discovery | Search public convention, organization and community sources |
| 18 | Data architecture | Draft source registry, provenance, event metadata and profile separation |
| 19 | API contracts | Versioned read/write contract, cursor pagination and response allowlists |
| 20 | Privacy and RLS | Proposed SQL only; no production application |
| 21 | UI/UX architecture | Mobile-first navigation, trust labels, reporting and accessibility |
| 22 | Mobile readiness | API and mobile client acceptance criteria |
| 23 | Firecrawl source pilot | Discovery-only candidates; no bulk crawl or import |
| 24 | VibeRaven review | Static SQL review before migration conversion |
| 25 | Supabase live review | RLS/advisor/migration baseline check |
| 26 | GitHub integration | Commit deliverables on isolated feature branch |
| 27 | Vercel review | Inspect linked project and latest deployment constraints |
| 28 | Atlassian planning | Search for an existing FurFinder project; no project/issue creation without target approval |
| 29 | Release readiness | CI, preview, database and moderation gates; no merge/deploy by default |

## Current findings

- GitHub PR #15 remains open and Draft. This work is isolated on a new feature branch.
- Supabase currently has 3 public tables: listings (10 rows), moderators (0), moderation_events (0); RLS is enabled on all three.
- Security Advisor returned 0 lints.
- Performance Advisor returned 2 INFO unused-index notices for moderation-event indexes; retain pending workload evidence.
- Supabase production migration history currently contains 6 migrations.
- Firecrawl current balance: 1,250 credits. Search calls used a small number of credits; no bulk crawl was started.
- Vercel project furfinder is linked to Hanzet22/FurFinder on the Hobby team. A previous build-rate-limit failure means a fresh preview must be independently confirmed before claiming validation.
- The existing app is Vite + React + TypeScript; package scripts include typecheck, test and build.

## Source discovery results (not imported)

- FurryCons worldwide calendar: https://furrycons.com/calendar/ — aggregator/discovery aid only; organizer confirmation required.
- WikiFur regional groups category: https://en.wikifur.com/wiki/Category:Regional_groups — community-maintained index; each entity requires a primary-source check.
- NC Anthro Society groups page: https://ncanthrosociety.org/groups — public regional group index; candidates only.
- Oregon State Furry Club page: https://clubs.oregonstate.edu/furries — institution-hosted public club page; candidate only.
- Furscience: https://furscience.com/ — public research resource candidate, not a community membership directory.

## Safety and release boundaries

- No scraping of attendee lists, private groups, member rosters, private contact details or personal location data.
- No public individual profiles for minors; adult profiles must be voluntary, consented and unpublished by default.
- No production migrations, bulk data imports, deployment promotion, PR merge or new Atlassian project creation in this round set.
- Proposed SQL is intentionally outside `supabase/migrations/` until reviewed and converted through the repository's migration workflow.
