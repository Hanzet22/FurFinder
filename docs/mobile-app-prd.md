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
