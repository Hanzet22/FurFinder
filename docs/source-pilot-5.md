# FurFinder — Official Source Pilot 5

**Reviewed:** 2026-10-31  
**Status:** source evidence only; no event listing imported or published.

## Candidate A: Further Confusion 2027

Primary organizer sources:
- Homepage: https://furtherconfusion.org/
- Official map page: https://furtherconfusion.org/map/
- Publisher: Further Confusion / Anthropomorphic Arts and Education.
- Firecrawl fetch: homepage HTTP 200; map page HTTP 200. Search result from the official map page exposes the organizer's date range.

Organizer-supported fields:
- Event identity: Further Confusion 2027.
- Announced dates: 14–18 January 2027 (official map page search excerpt).
- City: San Jose, California, based on the organizer homepage description.
- Venue/address: not recorded in this pilot. The map page retrieved in the live scrape contains venue-map resources but the page body does not independently restate a 2027 venue/address. Do not infer the venue from a previous year's map or an aggregator.

Evidence boundary:
- Homepage supports organizer identity and San Jose context.
- Official map page search excerpt supports 01/14/2027–01/18/2027.
- The live map page content contains map assets labelled for 2026; those assets are not evidence of 2027 room layout or venue arrangements.
- No event artwork, logos, attendee photos, room bookings or attendee data are reused.

## Candidate B: Anthrocon 2027

Primary organizer source:
- https://www.anthrocon.org/
- Publisher: Anthrocon organizer.
- Firecrawl fetch: HTTP 200.

Organizer-supported fields:
- Event identity: Anthrocon 2027.
- Announced dates: 1–4 July 2027, as stated in the official page title metadata.
- Venue: not added by this pilot. The homepage links to a hotel information page, but this pass did not validate a single exclusive convention venue.

Evidence boundary:
- The official homepage title supports the 2027 edition and dates.
- Do not infer convention venue from hotel links or third-party calendars.
- The homepage contains credited event photography; public visibility is not permission to copy or republish it.

## Discovery-only context

https://furrycons.com/calendar/

The aggregator can help discover events and cross-check candidate dates, but it is not the publication authority. Each listing field needs its own organizer-source evidence.

## Decision

Keep both events as **pending source-review candidates**. No Supabase data was inserted, no public listing was created, and no organizer affiliation or endorsement is implied.

Before publication, a moderator must re-open the organizer's current pages and verify the event name, dates, region, status, official URL and any venue field independently. Store only the minimum evidence needed for provenance.
