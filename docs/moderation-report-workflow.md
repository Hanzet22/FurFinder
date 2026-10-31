# FurFinder — Moderation Report & Correction Workflow

**Status:** design specification only; no report endpoint or database table is implemented.

## Purpose

Give visitors a safe way to report inaccurate, outdated, unsafe or improperly published directory entries without turning FurFinder into a people-finder or a public complaint board.

## In scope

- Incorrect organization or community details.
- Event date, status or public venue corrections.
- Broken official links.
- Suspected impersonation or misleading affiliation claims.
- Requests to remove or correct a public entity listing.
- Licensing, attribution or source-use concerns.
- Abuse of the submission or report workflow.

## Out of scope

- Reports about private individuals or attendee behavior.
- Requests to identify, locate or contact a person.
- Public member rosters, private group membership, private conversations or precise personal whereabouts.
- Public report feeds, public reporter profiles or public accusations.
- Collection of identity documents or sensitive personal data through the report form.

## Proposed visitor flow

1. Visitor selects **Report or suggest a correction** from a public listing.
2. Form identifies the listing by its public slug; reporter may optionally supply a reply address, but anonymous reporting remains possible where operationally safe.
3. Reporter chooses a bounded reason and supplies a short explanation.
4. Evidence is limited to public URLs and optional text. Do not request screenshots containing private messages, personal contact details or attendee information.
5. Server validates the request, applies abuse controls, stores it in a private moderation queue and returns a generic receipt.
6. A moderator checks the listing and evidence against primary sources.
7. Moderator records a decision: accepted, partially accepted, needs clarification, rejected, duplicate or escalated.
8. Public listing changes only through the existing controlled moderation/publishing process.

## Proposed reason codes

| Code | Meaning |
|---|---|
| `outdated_information` | Date, status, link or description is stale |
| `incorrect_information` | Public listing field appears inaccurate |
| `broken_link` | Official website or source URL is unavailable |
| `misrepresentation` | Affiliation, identity or endorsement claim is misleading |
| `privacy_or_safety` | Public listing appears to expose personal or sensitive information |
| `licensing_or_attribution` | Concern about reuse, attribution or permission |
| `removal_request` | Request to remove a public entity listing |
| `other` | Other directory-quality concern |

## Data minimization

The eventual schema should store only:
- Random report ID.
- Target public listing ID.
- Bounded reason code.
- Short text with a strict character limit.
- Optional public evidence URLs after HTTPS validation.
- Created/updated timestamps.
- Private moderation status and reviewer decision.
- Abuse-control metadata only where necessary, with a documented retention period.

Do not store reporter IP addresses indefinitely. If transient abuse controls require network metadata, document purpose, access restrictions, expiry and deletion behavior before implementation. Do not store exact birth dates, government identifiers, private contact lists, private chats or attendee data.

## Security requirements

- Public users can create reports but cannot read the queue or other reports.
- Moderator reads and state changes require server-side authorization and audit logging.
- Never trust a client-supplied moderator role or user metadata for authorization.
- Validate target listing existence without revealing unpublished/private record state.
- Apply bounded request bodies, content-type validation, URL validation, rate limiting and generic error responses.
- Prevent open redirects and unsafe URL schemes.
- Treat report text and evidence as untrusted input; render safely and do not execute embedded HTML.
- Add duplicate detection and a moderation abuse escalation path.
- Do not expose reporter identity or evidence publicly.

## Retention and operations decisions required before implementation

1. Set a retention period for unresolved and closed reports.
2. Decide whether anonymous reports are supported and under what abuse constraints.
3. Define moderator roles, escalation and appeal handling.
4. Define deletion/export handling for any optional reply address.
5. Decide whether sensitive safety reports require a separate restricted queue.
6. Approve database schema and RLS policy tests.
7. Add API, authorization, abuse and accessibility tests before deployment.

## Acceptance criteria

- A visitor can submit a bounded report without creating a public profile.
- Public clients cannot read reports or moderation notes.
- Report content is never published automatically.
- The moderation action is auditable.
- The reporter receives no information about hidden or private listing state.
- The workflow collects no attendee roster, private contact or precise personal-location data.
- No public profile for a minor is created or inferred through a report.
