# FurFinder — Source Register

**Last reviewed:** 2026-10-31  
**Purpose:** track public sources used for discovery and factual verification. This is not a complete global inventory.

## Source-use rules

1. Prefer the entity's or event organizer's official website for dates, venues, policies and contact routes.
2. Use aggregators and community-maintained indexes to discover candidates, not as the sole authority for important facts.
3. Record canonical URL, publisher, source type, fields supported, retrieval time and reviewer decision in the source registry.
4. Review terms, robots directives, access controls, API terms and rate limits before automated retrieval.
5. Preserve field-level provenance. A source supporting an event date does not automatically support its venue, legal status or partnership claims.
6. Send candidates to human moderation. Discovery or scraping must never publish a listing automatically.
7. Re-check time-sensitive event information and label stale or unconfirmed details.
8. Do not harvest private rosters, attendee lists, private contact details, private conversations or precise personal location data.
9. Scraped social profiles are not consent to create individual profiles. Public individual profiles require voluntary adult registration and explicit consent.

## Organizer and official sources

| Source | Type | Appropriate use | Pilot status |
|---|---|---|---|
| [JMoF](https://www.jmof.jp/) | Official organizer | Organizer-published event dates and venue | 2027 candidate; reconfirm before import |
| [Anthrocon](https://www.anthrocon.org/) | Official organizer | Event identity and announced dates | Pilot 7; 1–4 Jul 2027 supported by homepage and registration page; venue not asserted |
| [ConFuzzled](https://confuzzled.org.uk/) | Official organizer | Organizer-published dates, venue and policy links | 2027 candidate; review terms before recurring retrieval |
| [Further Confusion](https://furtherconfusion.org/) | Official organizer | Event identity, date and venue | Pilot 7; official homepage capture states 14–18 Jan 2027 and San Jose Convention Center; pending moderation |
| [Oregon State University Furry Club](https://clubs.oregonstate.edu/furries) | Institution-hosted page | Public club identity and institution link | Discovery candidate; not imported |
| [North Carolina Anthro Society groups](https://ncanthrosociety.org/groups) | Public organization index | Discover public group pages | Discovery candidate; verify each group independently |
| [Furscience](https://furscience.com/) | Public research resource | Research and educational resource listing | Discovery candidate; not imported |
| [Anthro Northwest](https://www.anthronw.com/anw9/index.html) | Official organizer | Event identity, dates and event information | Pilot 6; 7–10 Jan 2027; venue confirmed on official registration page; pending moderation |
| [NordicFuzzCon](https://nordicfuzzcon.org/) | Official organizer | Event identity, dates and broad locality | Pilot 6; 24–28 Feb 2027 in Malmö, Sweden; venue not asserted; pending moderation |
| [Las Vegas Fur Con](https://lasvegasfurcon.org/) | Official organizer | Event identity and date | Pilot 7; 25–28 Mar 2027; venue not asserted; pending moderation |

## Discovery-only sources

| Source | Type | Limitation |
|---|---|---|
| [FurryCons calendar](https://furrycons.com/calendar/) | Third-party event aggregator | Discovery only; verify each event on its organizer's official page |
| [WikiFur regional groups](https://en.wikifur.com/wiki/Category:Regional_groups) | Community-maintained index | Entries may be incomplete or stale; independently verify current status |

## Event candidates from earlier pilots

These candidates have not been imported into Supabase or published as FurFinder listings.

| Event | Candidate information | Verification caveat |
|---|---|---|
| JMoF 2027 | 8–10 January 2027; Aichi Sky Expo, Tokoname, Japan | Reconfirm directly with organizer before import |
| Anthrocon 2027 | 1–4 July 2027 | Venue not asserted by pilot 7 |
| ConFuzzled 2027 | 28 May–1 June 2027; Hilton Birmingham Metropole | Recheck organizer page and terms before import |
| MYFurCon 2027: FurGear | 24–25 April 2027; Hotel Armada Petaling Jaya | Official homepage checked 2026-10-31; candidate only |
| Fur-Eh! 2027: FURBALLS | 15–18 July 2027; Edmonton, Canada | Official homepage checked 2026-10-31; venue not confirmed |
| Las Vegas Fur Con 2027 | 25–28 March 2027 | Official homepage confirms dates; hotel page describes multiple partner properties; no exclusive venue claim |
| Further Confusion 2027 | 14–18 January 2027; San Jose Convention Center | Official homepage search capture supports date and venue; pending review |
| Anthrocon 2027 | 1–4 July 2027 | Official homepage and registration page support date; no venue asserted |

See [source pilot 3](docs/source-pilot-3.md), [source pilot 4](docs/source-pilot-4.md), [source pilot 5](docs/source-pilot-5.md), [source pilot 6](docs/source-pilot-6.md) and [source pilot 7](docs/source-pilot-7.md) for evidence boundaries.

## Required source-record fields

For each source considered for ingestion, maintain:
- Canonical URL and original URL.
- Publisher or organization name.
- Source type (official organizer, official organization, public community, public portfolio, aggregator or public resource).
- Retrieval and last-checked timestamps.
- Terms-of-use and robots review states.
- Specific listing fields supported by the source.
- Evidence needed for moderation, within permitted use.
- Reviewer and decision (pending, approved, restricted or rejected).
- Recheck schedule for time-sensitive data.

Do not store unnecessary personal information in source notes. Keep internal review notes private and never expose raw crawl captures or internal eligibility notes through public APIs.

## Import and publication gate

A candidate may move from discovery to a pending submission only after source and access conditions have been reviewed. A moderator must verify relevant fields against the primary source before publication. A successful scrape alone is not verification.

No source listed here should be interpreted as an endorsement, partnership, affiliation or blanket permission to crawl or reuse its content.

## Organizer policy pages reviewed

These policy pages are relevant context for source governance. They are not blanket permissions to scrape, republish images, or reuse event branding.

- [JMoF Terms of Participation](https://www.jmof.jp/en/participation-policy) — includes rules for photography, video recording and public disclosure of event information. Treat attendee imagery and event-content publication cautiously; do not infer that public event pages authorize reuse of participant photos or recordings.
- [Anthrocon Standards of Conduct](https://www.anthrocon.org/standards-of-conduct/) — organizer conduct guidance; review current organizer policies before listing event-specific participation details.
- [ConFuzzled Code of Conduct](https://confuzzled.org.uk/code-of-conduct) — page links to Terms and Conditions, Conditions of Sale, Privacy Policy and Media Access. Its media rules include restrictions on publication/commercial use of convention photography and video without written permission. Do not ingest or republish attendee images or event artwork based only on public accessibility.

Policy pages should be rechecked at the time of ingestion because organizers may update them. Store policy URLs and review timestamps, not copied policy text, unless reuse is expressly permitted.

## Round 94 — Official source pilot 6

- [Anthro Northwest 9](https://www.anthronw.com/anw9/index.html) — official event page supports 7–10 January 2027; official [registration/hotel page](https://anthronw.com/anw9/register/) confirms Hyatt Regency Seattle as venue.
- [NordicFuzzCon 2027](https://nordicfuzzcon.org/) — official homepage supports 24–28 February 2027 and Malmö, Sweden; the captured page does not establish a specific venue, so none is asserted.
- [FurryCons calendar](https://furrycons.com/calendar/) was used only for candidate discovery and is not the authority for event facts.

Both candidates remain pending source-terms/access review and human moderation. Neither has been imported or published. See [source pilot 6](docs/source-pilot-6.md).

## Round 97–100 — Official source pilot 7

- [Further Confusion 2027](https://furtherconfusion.org/) — official homepage search capture states 14–18 January 2027 and San Jose Convention Center. The official [registration page](https://furtherconfusion.org/register/) confirms registration for the 2027 event is open; no attendee or registration-account data was collected.
- [Anthrocon 2027](https://www.anthrocon.org/) — official homepage metadata states 1–4 July 2027; official [registration page](https://www.anthrocon.org/registration/) independently states on-site registration runs 1–4 July 2027. Venue not asserted.
- [Las Vegas Fur Con 2027](https://lasvegasfurcon.org/) — official homepage states 25–28 March 2027. The separate hotel page describes partner hotels; no exclusive venue is asserted.
- [FurryCons calendar](https://furrycons.com/calendar/) remains discovery-only.

All three candidates remain pending terms/access review and human moderation. None has been imported or published. No media or attendee data was copied. See [source pilot 7](docs/source-pilot-7.md).
