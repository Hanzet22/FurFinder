# FurFinder Mobile Companion — Product Brief

## Goal
Provide a lightweight Flutter mobile client for discovering public furry communities, conventions, creators, organizations and industry resources. The mobile app consumes the same versioned API and PostgreSQL-backed directory as the web client.

## Audience and safety
- General community discovery with age-appropriate public information.
- No adult-content categories, private meetups, direct messaging, or unmoderated contact features.
- Show official public links only; do not expose private phone numbers or home addresses.
- Add report/correction paths and moderation review before allowing submissions.

## MVP screens
1. Explore — curated categories and recently verified public listings.
2. Search — text, category and region filters.
3. Listing detail — summary, region, official website, source and last-reviewed date.
4. Knowledge — public safety, convention and community guides.
5. Settings — language, accessibility, privacy and app information.

## Technical direction
- Primary mobile framework: Dart + Flutter.
- Android-native integrations: Java only where Flutter plugins cannot meet a specific platform requirement.
- API: versioned HTTPS JSON contract shared with the Vite web client.
- Database: Supabase PostgreSQL; never connect mobile clients with service-role credentials.
- Offline: cache public listing metadata with an explicit refresh timestamp; no sensitive personal data in local cache.
- Accessibility: semantic labels, scalable text, keyboard/switch access where supported, reduced motion and readable contrast.

## Acceptance criteria
- Search and filters produce the same results as the web API.
- Detail pages show source provenance and last-reviewed information.
- Empty, offline, loading and server-error states are distinct.
- No secret key is present in the app bundle.
- App can be built and tested in CI.
- Report and correction actions route to a moderated, rate-limited workflow.

## Release sequence
- M0: API contract and screen prototype.
- M1: read-only Flutter client.
- M2: accessibility, offline cache and automated tests.
- M3: closed testing and privacy review.
- M4: public release only after moderation and operational readiness.

## Current implementation gap assessment

The current repository is a responsive Vite web client, not a shipped Flutter app. The web directory now reads published listings through the same-origin `GET /api/v1/listings` route, with bounded filters and signed keyset cursors. The route uses the publishable key for public database reads and keeps cursor signing server-side. The existing submission route remains a web-oriented flow that requires a same-origin request and a Cloudflare Turnstile token bound to the web hostname.

Before a Flutter client can reuse the same product workflows, close these gaps:

1. **Versioned public API:** the first read endpoint, `GET /api/v1/listings`, is implemented on the feature branch and documented. Listing detail lookup is now implemented on the web feature branch through `GET /api/v1/listings/{slug}`; event joins and a formal API stability/release gate remain open.
2. **Mobile-safe submission:** design a separate mobile-compatible submission flow. Do not simply remove origin validation or bypass anti-abuse checks; choose an appropriate platform-compatible verification and rate-limiting design first.
3. **Report/correction workflow:** the current web flow supports suggestions, but a dedicated report/correction API and moderation outcome are still required.
4. **Pagination contract:** signed keyset pagination is implemented for the list endpoint. It still needs CI execution and controlled integration tests with duplicate timestamps and concurrent updates.
5. **Verification:** focused API unit tests have been added; CI execution, API integration tests and mobile integration tests are still required before treating the API as a stable mobile dependency.

The moderation endpoints remain privileged server workflows. A mobile public client must never receive the Supabase secret/service-role key or call moderator-only operations.

## Delivery status

- Web directory and moderator workflows: active development.
- Flutter companion: planned, not implemented.
- Mobile API contract: partial implementation; list endpoint and cursor pagination exist on the feature branch, but detail/report/event APIs and runtime validation remain open.
- App-store release: not ready until the API, privacy, accessibility and moderation gaps above are closed.


## Global directory expansion (A + B)

The mobile companion follows the expanded FurFinder scope while preserving strict separation between public entity discovery and voluntary adult profiles.

### Current public API detail contract
- `GET /api/v1/listings` returns bounded, published-only pages with signed keyset cursors.
- `GET /api/v1/listings/{slug}` returns one published listing by canonical slug, or 404 when unavailable.
- Both routes use explicit public-field projections and never return moderation notes, account identifiers, consent evidence or private fields.
- The web UI now has a detail dialog backed by the slug endpoint. This does not mean a Flutter client exists; the mobile client remains planned.

### Public directory entities
- Organizations and associations
- Public communities and public entry points
- Conventions and announced public events
- Studios, makers, manufacturers and businesses
- Public creator portfolios and professional services
- Public knowledge and safety resources

Search and filters use entity type, broad region and country. Event detail pages show organizer-published dates, coarse venue location, official source URL, source-check state and last-checked timestamp. Third-party calendars may help discover candidates but are not the authority for publication; verify event details against official organizer sources.

### Opt-in profile boundary
- Public individual profiles are adult-only (18+), voluntary and unpublished by default.
- Do not create public profiles for minors or infer profiles from scraped usernames, social posts, convention attendee lists or community rosters.
- The user chooses each public field and sees an exact preview before an explicit publish action.
- Provide immediate unpublish, consent withdrawal and deletion controls.
- Never expose account IDs, email, exact birth date, private contact information or precise personal location.
- No direct messaging, attendee discovery, public member search, real-time location or unrestricted profile exports.

### Mobile-specific acceptance criteria
- The app consumes a versioned public API and uses cursor pagination with stable ordering.
- Entity and adult-profile endpoints are separate and return allowlisted public fields only.
- Anonymous users can browse only published public entities.
- Profile creation is unavailable to under-18 users.
- Consent withdrawal immediately removes a profile from public API responses.
- Report/correction flows accept public evidence URLs and route to moderation.
- Offline cache contains public directory metadata only; no consent evidence, private account data or moderation notes.
- No Supabase service-role key or moderator credential is bundled in the app.
- All new workflows pass RLS, authorization, accessibility, privacy and minor-safety tests before release.

### Release gate
The expanded mobile client remains a future release. Do not ship profile features until age eligibility, consent, visibility preview, withdrawal/deletion, abuse reporting and jurisdiction-specific privacy review are complete. The read-only directory can ship earlier only after the versioned API, cursor pagination, official-source provenance and moderation/reporting contract are stable.
