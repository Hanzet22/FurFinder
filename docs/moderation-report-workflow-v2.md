# FurFinder — Listing Report and Moderation Workflow v2

Status: workflow and API contract only; no endpoint or database mutation is included.

## Purpose

Allow visitors to flag inaccurate, outdated, abusive, unsafe or improperly published listings while minimizing reporter data and preventing the feature from becoming a private messaging channel.

## Reporter experience

Categories: inaccurate information, outdated event details, impersonation, rights/licensing concern, privacy concern, safety concern, other. The explanation is optional, plain text and length-limited. No attachments in v1. No public report count, reporter identity or report text. No real name, phone, home address or social handle required. Confirmation explains that reports are reviewed by moderators and are not an emergency service.

## Suggested server contract

POST /api/v1/listings/:listingId/reports

Request allowlist:
- category: fixed enum.
- details: optional bounded plain text.
- sourceUrl: optional HTTPS URL when relevant.

Server derives listing identity from the route and creates its own timestamp and report ID. Never accept status, moderator ID, reporter account ID, priority or publication decision from the client.

Responses: 201 accepted with opaque receipt; 400 invalid fields; 404 listing not reportable; 413 too large; 429 rate limited; 500 generic error without internal details.

## Triage lifecycle

received → triaged → investigating → resolved | rejected | duplicate

A report never automatically unpublishes a listing. A moderator may hide a listing only through the separately authorized moderation action with reason and audit event.

## Privacy and abuse controls

- Minimize network metadata retention; do not expose IP addresses to moderators by default.
- If throttling needs a network-derived key, use a short-lived keyed digest with documented expiry; never store raw IP as report content.
- Avoid fingerprinting and third-party tracking.
- Enforce request-size limits, rate limits, category allowlists and output encoding.
- Disallow arbitrary HTML, attachments, executable URLs and direct reporter-to-listed-person contact.
- Keep reports and reporter details server-only; public APIs return no report metadata.
- Define retention before enabling the endpoint; support expiry and deletion/aggregation.
- Provide abuse handling for malicious or repeated reports.

## Moderator controls

Role-gated queue with minimal fields. Separate view, triage and hide/publish permissions. Every state transition records actor, timestamp, action and bounded reason code. Conflicts of interest can be reassigned. Reporter details are not shown unless essential and explicitly collected.

## Acceptance criteria

- Anonymous reporter cannot discover whether another person has reported.
- Report submission does not change listing visibility without separate moderator action.
- Unauthenticated users cannot access report queue or report details.
- Public listing API never returns report records or moderation notes.
- Validation and rate-limit failures are generic and safe.
- Keyboard and screen-reader users can submit and receive status feedback.
