# FurFinder Mobile Companion — Development Backlog v2

Status: product backlog only. Flutter implementation, build and store submission are not included.

## Product boundary

The companion is a read-only consumer of the public FurFinder API. It does not create a parallel directory database or expose moderation/private source records.

## MVP backlog

| Priority | Capability | Acceptance |
|---|---|---|
| Must | Browse published listings | Same published-only data and filters as web |
| Must | Listing detail and source link | Canonical public URL and attribution visible |
| Must | Search and pagination | Bounded query, cursor handling, duplicate-free append |
| Must | Loading/empty/offline/error states | Clear status and retry behavior |
| Must | Privacy-safe settings | No precise location permission or contact harvesting |
| Should | Saved public listings | Local-only, clearable, no server-side behavioral profile |
| Should | Event date display | Only source-verified dates and timezone |
| Could | Optional reminders | Explicit opt-in, local notification only, no attendee tracking |

## Excluded from MVP

Attendee discovery, attendee lists, member rosters, direct messaging, unsolicited contact, precise/background location, public minor profiles, adult-content discovery, moderator actions, report queue, privileged API access, automatic scraping or publishing.

## API and offline behavior

Use the existing same-origin public listing API. Respect cursor expiry and safely restart after an invalid cursor. Cache only public published responses with defined freshness/purge behavior. Do not persist private reports or moderation metadata. Offline mode may show previously fetched public listings with a visible stale label; never imply cached content is current.

## Release readiness

Before implementation: approve navigation, data contracts, privacy review and accessibility plan. Before beta: test supported Android devices, offline behavior, deep links, text scaling and screen-reader semantics. Before store submission: complete current privacy disclosures and policy review.
