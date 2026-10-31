# FurFinder Global Directory — Information Architecture

**Status:** Proposed IA for A + B  
**Platforms:** Responsive web first; Flutter companion after API readiness

## 1. Navigation model

Keep primary navigation to six destinations:

1. **Explore** — featured public entities, new and recently checked listings.
2. **Directory** — all public entities with search and filters.
3. **Conventions** — event calendar, event details and organizer links.
4. **Knowledge** — public guides, safety resources and community information.
5. **Submit a listing** — moderated suggestions for public entities only.
6. **Account** — sign-in, privacy settings and (eligible adults only) opt-in profile controls.

Do not put private profiles, attendee lists, direct messaging or location tracking in the primary navigation.

## 2. Sitemap

- Explore
  - Featured listings
  - Recently verified
  - Browse by category
  - Browse by region
- Directory
  - Search
  - Filters: entity type, region, country
  - Results
  - Listing detail
    - Overview
    - Official website
    - Source and verification status
    - Last checked
    - Report / suggest correction
- Conventions
  - Upcoming events
  - Past events
  - Event detail
    - Dates and coarse venue location
    - Organizer and official event website
    - Source status and last checked
    - Code of conduct / public attendee guidance (official links only)
- Knowledge
  - Community guides
  - Convention preparation
  - Safety and accessibility
  - Public resources
- Submit a listing
  - Eligibility and source rules
  - Public entity submission
  - Confirmation and status reference
- Account
  - Sign in / account security
  - Privacy and visibility
  - Adult profile (18+ only; opt-in)
    - Profile preview
    - Explicit publish / unpublish
    - Edit public fields
    - Withdraw consent / delete profile
  - Report and removal requests
- Utility
  - Language
  - Accessibility
  - About FurFinder
  - Privacy notice
  - Terms and source policy

## 3. Core user flows

### Discover a public entity
Explore → Directory → search/filter → result card → listing detail → official source.

### Discover a convention
Conventions → upcoming calendar → event detail → organizer's official event page.

### Suggest a public listing
Submit a listing → read source/eligibility rules → enter public entity details and source URL → submit → moderation queue → status notification.

The form must not ask for private member rosters, private contact details or an individual's home/location data.

### Adult opt-in profile
Account → age eligibility gate → explain fields and visibility → enter only user-supplied public fields → preview → explicit publish → manage/unpublish/delete.

If the user is under 18, do not show a public-profile creation path. Provide directory browsing and privacy settings only.

### Report or correct a listing
Listing detail → report/correction → select factual issue → provide optional public evidence URL → submit → moderation review → outcome.

## 4. Result-card content hierarchy

1. Name and entity type
2. Short summary
3. Country / broad region
4. Verification state (plain-language label)
5. Last checked date
6. Official website action

Avoid unverified badges, social popularity metrics, scraped follower counts and exact personal location.

## 5. Trust and status language

- **Community submitted** — suggested by a user; not yet source-checked.
- **Source checked** — a reviewer confirmed the displayed fields against the cited public source.
- **Officially confirmed** — the organization/event owner or official source explicitly confirms the listing.
- **Needs review** — a report or stale source requires moderator attention.
- **Archived** — no longer promoted as current; historical context may remain where appropriate.

Do not use a generic "verified" badge without explaining what was verified.

## 6. Responsive behavior and accessibility

- Desktop: top navigation, broad search, filter rail and multi-column result cards.
- Mobile: compact header, prominent search, filter sheet and single-column cards.
- Keep filter state visible and easy to clear.
- Use semantic headings, keyboard-operable controls, visible focus, accessible names and screen-reader status updates.
- Respect reduced-motion preferences and scalable text.
- Distinguish loading, empty, offline and error states.
- Do not rely on color alone for verification state.

## 7. Moderation and safety UX

- Explain why a source URL is requested.
- Show the user exactly which fields will become public.
- Keep moderation notes and account identifiers private.
- Provide a report/correction path on every listing.
- Provide a clear profile unpublish and deletion path.
- Do not enable direct messaging, public member search, attendee discovery or real-time location.

## 8. Tree-test tasks

Validate labels and hierarchy with representative users:
1. Find a convention happening in a selected country.
2. Find an official furry organization in a selected region.
3. Check why a listing is marked source-checked.
4. Suggest a correction to an outdated event date.
5. Find the privacy controls for an adult profile.
6. Unpublish an opt-in profile.
7. Find a public safety guide.

Success means users find the intended destination without needing to know FurFinder's internal data model.
