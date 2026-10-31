# FurFinder Public Source Registry — Pilot

**Status:** Discovery pilot only; no records imported into Supabase  
**Reviewed:** 2026-10-31

## Source 1 — FurryCons worldwide convention calendar

- URL: https://furrycons.com/calendar/
- Source type: third-party convention aggregator
- Intended use: discover candidate public convention records and official organizer links.
- Trust level: discovery aid; not sufficient by itself for final publication.
- Data handling: event name, public date range, public venue/city and organizer URL may be extracted for review when permitted by the site's terms.
- Exclusions: no attendee lists, personal social accounts, fursuiter rosters or private contact data.
- Review state: candidate source; terms and crawl policy must be checked before recurring ingestion.

## Source 2 — Infurnity official website

- URL: https://www.infurnity.com/en/
- Source type: official event organizer website
- Source identity: the site describes Infurnity as a Taiwanese furry convention.
- Useful public pages:
  - Schedule: https://www.infurnity.com/en/event-en/
  - Venue/hotel: https://www.infurnity.com/en/hotel-en/
  - 2026 information: https://www.infurnity.com/en/2026-info-en/
  - Code of conduct: https://www.infurnity.com/en/code-of-conduct-en/
- Observed evidence:
  - The official homepage contains current Infurnity 2026 notices.
  - The official hotel page identifies Taichung Lihpao Resort Fullon Hotel.
  - The official schedule page says the event spans three days but the extracted page did not expose exact calendar dates.
  - The official 2026 information page contains event guidance and resort information, but the retrieved content did not independently expose a complete start/end date range.
- Review state: official organizer source identified; exact date range still needs explicit official confirmation before a published event record can be marked officially confirmed.

## Pilot candidate — Infurnity 2026

- Candidate discovery page: https://furrycons.com/event/28134/infurnity-2026
- Candidate event name: Infurnity 2026
- Candidate date range reported by aggregator: 2026-10-30 through 2026-11-01
- Candidate venue reported by aggregator: Fullon Hotel Lihpao Land, Taichung City, Taiwan
- Official organizer page: https://www.infurnity.com/en/
- Official venue evidence: https://www.infurnity.com/en/hotel-en/ identifies Taichung Lihpao Resort Fullon Hotel.
- Publication decision: **do not import yet**. The venue is supported by the official page, but the exact date range was not independently confirmed in the official pages retrieved during this pilot. Keep the dates as aggregator-sourced candidate data pending further review.

## Collection exclusions discovered on the official site

The official site links a Fursuit Roster. Do not ingest or index individual roster entries as FurFinder profiles. A public page does not equal opt-in consent for an unrelated directory. The directory may link to the organizer's public event pages without copying personal roster details.

## Next source-review steps

1. Review terms of service and robots directives for each source before automated crawling.
2. Add additional official convention and organization sources only after identifying their publisher and public purpose.
3. Keep aggregator results in a candidate queue until an official organizer page corroborates the relevant fields.
4. Record source URL, retrieval timestamp, fields supported and review decision.
5. Never automatically publish scraped records.
