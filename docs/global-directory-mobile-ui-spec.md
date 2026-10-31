# FurFinder Global Directory — UI/UX & Mobile Implementation Spec

**Status:** design specification for the feature branch.  
**Product direction:** a fast, trustworthy global directory—not a people-finder or attendee tracker.

## Information architecture

Primary navigation:
1. Explore
2. Conventions
3. Communities
4. Organizations
5. Studios & Creators (public portfolio pages only)
6. Resources
7. Submit a listing
8. Account

## Explore screen

- Search input with clear button and accessible label.
- Filter chips: category, region, country, event status.
- Results list with entity name, category, coarse region, verification label and last-checked date.
- Event cards display organizer-confirmed dates and timezone; unconfirmed dates must be visibly labelled.
- Empty, offline, loading and retry states.
- Sort options: relevance, recently verified, upcoming events.

## Listing detail

- Name, summary, entity type and coarse geography.
- Official website as primary action.
- Source attribution and verification explanation.
- Event dates, timezone, venue name and event status where confirmed.
- “Suggest correction” and “Report listing” controls.
- No attendee list, member roster, precise personal location or direct-message action.

## Trust labels

- **Community submitted:** supplied by a community member; not independently checked.
- **Source checked:** relevant public source reviewed by a moderator.
- **Officially confirmed:** organizer or entity's own official page confirms the displayed facts.
- **Needs re-check:** source is stale or changed; do not imply current confirmation.

## Adult opt-in profile boundary

- Profile creation is separate from entity listings.
- Under-18 users do not receive a public profile creation flow.
- Adults see a preview of every field before publication.
- Default visibility is private/unpublished.
- Publish requires a distinct consent action; unpublish and delete are easy to find.
- Do not add follower counts, people discovery, public member search, DMs or bulk profile export to the MVP.

## Visual design direction

- Responsive, mobile-first layout with a calm editorial directory aesthetic.
- Strong typographic hierarchy; readable body text and visible focus states.
- Use existing FurFinder brand tokens where available; avoid inventing a new brand palette before reviewing the current CSS.
- Cards use consistent spacing, clear source/trust metadata and no deceptive endorsement styling.
- Touch targets should be comfortably usable; forms must have labels, inline errors and keyboard support.
- Respect reduced-motion preferences and avoid motion-only status cues.

## Mobile API requirements

- Versioned API only.
- Cursor pagination and bounded page size.
- Explicit response allowlists.
- Public read-only access for directory content.
- No service-role key or secret in the mobile bundle.
- Cache only public listings; clear profile cache on unpublish/withdrawal.
- Localization-ready strings and timezone-aware event display.

## Acceptance criteria

- Search and filters work without horizontal overflow at narrow mobile widths.
- Screen readers can identify filters, loading state, result count and report controls.
- A user can identify why a listing is marked verified.
- Unconfirmed event dates cannot be mistaken for official confirmation.
- No route exposes attendee/member rosters or private individual records.
