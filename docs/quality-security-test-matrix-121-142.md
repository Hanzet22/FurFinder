# FurFinder — Quality and Security Test Matrix, Rounds 121–142

Status: test plan only. No execution is claimed.

| Area | Test | Expected result |
|---|---|---|
| Public API | Anonymous list request | Published, allowlisted fields only |
| Public API | Pending/rejected detail ID | Not publicly discoverable |
| Public API | Invalid/expired cursor | Safe validation; no unbounded fallback |
| Public API | Excessive filters/page size | Bounded rejection or normalized query |
| XML | DTD/external entity document | Rejected; no file/network access |
| XML | Oversized/deep/large document | Rejected within resource limits |
| XML | Unknown field/namespace | Rejected; no silent promotion |
| XML | Duplicate upload | Idempotent pending candidate |
| Moderation | Non-moderator import/publish | Denied server-side |
| Moderation | Report submission | Private pending report only |
| Moderation | Public API after report | No report metadata leakage |
| Privacy | Public minor profile attempt | No publication path |
| Privacy | Withdrawn adult profile | No longer publicly readable |
| Source governance | Terms/access not reviewed | Candidate remains pending |
| Source governance | Aggregator-only claim | Discovery evidence only |
| UX | Keyboard-only journey | All actions operable with visible focus |
| UX | 320px and 200% zoom | No loss of core content/function |
| UX | Screen reader | Names, roles, values and status changes conveyed |
| UX | Reduced motion | Non-essential motion suppressed |
| Mobile | Offline cache | Stale indicator; no private data cached |
| CI | Candidate head changes | New exact-head CI evidence required |

## Evidence capture template

Record candidate branch and full SHA; environment and deployment ID; browser/device/OS and assistive technology versions; test ID, steps, expected and actual result; pass/fail, issue link, severity and retest; tester and timestamp.

## Security boundaries

VibeRaven is static source analysis and cannot prove live database policy behavior. Supabase Advisors are live project signals but do not replace authorization tests. A successful CI run does not prove preview or production behavior. Do not promote a candidate based on documentation-only evidence.
