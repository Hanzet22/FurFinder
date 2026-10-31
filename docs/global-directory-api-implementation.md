# FurFinder — Global Directory API Implementation

**Status:** partial feature-branch implementation  
**Reviewed:** 2026-10-31  
**Implementation branch:** `feat/global-directory-rounds-16-29`; follow-up documentation branch: `feat/global-directory-rounds-72-91`  
**Related contract:** [global-directory-api-contracts.md](global-directory-api-contracts.md)

## Implemented in this branch

### `GET /api/v1/listings`

The web client now reads public directory entries through the versioned Vercel API route instead of calling the Supabase REST endpoint directly.

Supported query parameters:

| Parameter | Validation | Behavior |
|---|---|---|
| `q` | Up to 100 Unicode letters/numbers, spaces or hyphens | Searches public listing name and summary |
| `category` | Existing six-category allowlist | Exact category filter |
| `region` | Existing five-region allowlist | Exact region filter |
| `country` | Two-letter country code | Exact country filter |
| `limit` | Integer 1–50; default 20 | Bounded page size |
| `cursor` | Server-generated signed token | Stable continuation |

The endpoint:
- Uses an explicit PostgREST column selection.
- Restricts rows to `status=published`.
- Orders by `created_at DESC, id ASC` and uses keyset pagination.
- Fetches one extra row to determine whether another page exists.
- Returns a stable envelope: `{ data, page: { next_cursor, has_more, limit } }`.
- Validates the upstream response before returning it.
- Projects an explicit public-field allowlist; it does not return moderation notes, account identifiers, consent evidence or private fields.
- Uses the Supabase publishable key for the read request. The server-only Supabase secret is used only as the HMAC-SHA-256 signing key for cursors; it is never returned to the client.

### `GET /api/v1/listings/{slug}`

A second read-only route returns one public listing by its canonical slug.

- Uses the same explicit public column allowlist as the list endpoint.
- Requires `status=published` and an exact slug match.
- Rejects malformed slugs before contacting Supabase.
- Returns HTTP 404 for missing or unpublished entries without revealing whether a private/pending row exists.
- Uses the publishable key for the read and the shared seven-second upstream timeout.
- Uses the same public response projection; no moderation, account or private fields are returned.

### Signed cursor behavior

A cursor contains the last row's `created_at` and `id`, wrapped in a versioned payload and authenticated with HMAC-SHA-256. Invalid, altered, malformed or older-than-24-hours tokens are rejected with HTTP 400. Rotating the server signing key also invalidates existing cursors. Rotating the server signing key invalidates existing cursors, which clients can recover from by restarting pagination.

### Web client

- `src/lib/directory.ts` validates the list envelope and individual listing records; it now exposes `fetchListingBySlug` for detail reads.
- `src/App.tsx` uses TanStack Query's infinite-query cursor flow and opens an accessible native dialog for listing details.
- `src/components/ListingDetailDialog.tsx` handles loading, unavailable and loaded states, with official-site and source links.
- Search, category and region changes form part of the query key and restart the result set.
- The client does not require a Supabase key for public directory reads.

## Not implemented yet

These remain separate follow-up work and are not implied by the current GET route:

- `POST /api/v1/reports` — requires an approved report table, retention policy, moderation workflow and abuse controls.
- Event metadata joins and event-status filtering — proposed schema has not been applied.
- Adult opt-in public profile routes — no production schema or eligibility workflow exists; no minor public profiles.
- Distributed rate limiting and abuse telemetry — bounded request validation is present, but no distributed rate limiter is claimed.
- Flutter/mobile client implementation — the existing mobile PRD remains a specification, not a built app.

## Configuration and operations

The route reuses the existing server configuration contract:
- `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (or the existing legacy service-role fallback used by the shared server helper)

Never place the secret key in a `VITE_*` browser variable. The API uses a seven-second upstream timeout and generic public errors; database error details are not returned.

## Verification status

- Unit tests in `tests/directory-api.test.mjs` cover filter validation, signed cursor integrity, tampering, 24-hour expiry, malformed cursors, public response projection and canonical listing-slug validation.
- GitHub Actions run [41164180538](https://github.com/Hanzet22/FurFinder/actions/runs/41164180538) passed all 45 tests and `npm run build` at PR #16 head `0307eeb`, including seven endpoint-level tests for the detail route.
- Supabase production schema and data were not changed.
- The proposed global-directory SQL remains under `supabase/proposed/`, not `supabase/migrations/`.
- VibeRaven static review is separate from live database testing; see the execution log.

## Security and privacy boundaries

The API is for public entities and public-facing resources, not a people-finder. It must not be extended to expose attendee lists, private group rosters, private contact details, home addresses, precise personal locations, private messages or sensitive personal data. Public individual profiles, if ever implemented, remain voluntary, adults-only, private by default and subject to explicit publication consent and a trusted eligibility workflow.
