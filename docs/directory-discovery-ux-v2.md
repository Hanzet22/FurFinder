# FurFinder — Directory Discovery UX v2

Status: design specification and acceptance criteria; no conformance or device testing claimed.

## Core journey

1. Overview explains what FurFinder indexes.
2. Search covers public organization, community, event, studio and resource names.
3. Filters are explicit, removable chips; selected filters remain visible and resettable.
4. Results show published records and concise, non-sensitive public metadata.
5. Detail shows canonical homepage, category, source-supported region, last-reviewed date and attribution.
6. Report action is available without exposing reporter or moderator information.

## Result card

Display name, entity category, bounded summary, verified country/region or event date, and last-reviewed date. Exclude attendee counts, member lists, personal location, private contact details and copied artwork.

## Required states

Loading with accessible announcement; results; no results with reset; empty directory; offline/network error with retry; invalid query; stale listing notice; pagination loading/end; report success, validation error and rate-limit response.

## Interaction requirements

- Debounce search and cancel stale requests.
- Filter changes reset cursor pagination.
- Load-more appends without losing position.
- Back navigation restores query and filters.
- Dialogs and menus contain focus and restore focus to trigger.
- Respect reduced-motion preferences.
- Never communicate state by color alone.

## Responsive/accessibility acceptance

- Reflow at 320 CSS px without horizontal page scrolling.
- Keyboard access to search, filters, cards, dialogs and pagination.
- Visible focus on every interactive element.
- Programmatic labels and instructions for controls.
- Dynamic result count announced without interrupting typing.
- 200% zoom remains usable.
- Contrast requirements met.
- Empty/error/success states understandable without color or icons.
- Manual testing with a screen reader and mobile viewport required before any conformance claim.

## Privacy and content

No public profiles for minors, exact personal locations or private contacts. Community listings are not invitations to contact individual members. Only approved, source-attributed text may be shown; logos, artwork and photos require separate permission.
