# FurFinder — Development Plan, Rounds 121–142

Date: 2026-10-31
Base: e5f9d705b13d4b4670a83294688e8db9156d72bc
Intent: resume product development. GREEN means engineering may continue; it is not deployment or production approval.

## Round register

| Rounds | Workstream | Deliverable | Boundary |
|---|---|---|---|
| 121–124 | Trusted XML intake | Importer design, strict v1 mapping, parser security and validation | Specification only; no runtime importer shipped |
| 125–128 | Report and moderation | Privacy-minimizing report intake, triage, audit and retention | Workflow contract only; no endpoint or live data write |
| 129–132 | Directory discovery UX | Search, filters, pagination, detail and attribution states | UX acceptance specification; no device test claimed |
| 133–136 | Mobile companion | Read-only API parity, offline/error behavior and release boundaries | Flutter remains backlog only; no app build |
| 137–140 | Quality and security | API, XML, privacy and accessibility test matrix | Test cases defined; execution not claimed |
| 141–142 | Integration and governance | Jira tracking, provider evidence and status semantics | Development GREEN; deployment independently gated |

## Status semantics

- Development GREEN: engineering work, design, tests and documentation may continue on feature branches.
- Preview YELLOW: preview may be stale or unavailable; no release validation is implied.
- Production not authorized: no production deployment, promotion, merge, migration, DDL or production data write is authorized by this work.

## Global acceptance boundaries

- Public reads remain published-only and read-only.
- Imported candidates remain pending until human moderator approval.
- XML is untrusted: disable DTDs and external entity resolution; reject unsafe constructs and oversized input.
- Never ingest attendee lists, private rosters, private contacts, private chats, precise personal locations or sensitive personal data.
- No public profiles for minors. Individual public profiles remain adults-only, voluntary and explicit-consent gated.
- Public URLs do not grant permission to reuse artwork, logos, photography or event media.
- Server-only provenance and moderation evidence must not become browser-readable.
- Do not claim accessibility conformance without manual and assistive-technology testing.

## Evidence refreshed

- Supabase Security Advisor: 0 lints.
- Supabase Performance Advisor: 2 INFO unused-index notices on existing moderation-event indexes; no index changes.
- VibeRaven 1.7.1 static scan: 0 critical, 0 high, 0 warning, 2 INFO for server-only provenance tables. Not a live DB/auth test.
- Firecrawl research: OWASP XML External Entity Prevention Cheat Sheet recommends disabling DTDs and external entity resolution.
- Vercel visible READY deployment still points to earlier commit 49c716e48283c18bf21476a86b69d4e1e71b9493, not this branch. No deployment attempted.

No merge, deployment, promotion, rollback, environment change, migration, DDL, production data write, listing publication or mobile store submission was performed.
