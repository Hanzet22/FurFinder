# FurFinder — Global Directory API Implementation

**Status:** partial feature-branch implementation  
**Reviewed:** 2026-10-31  
**Branch:** `feat/global-directory-rounds-16-29`  
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

### Signed cursor behavior

A cursor contains the last row's `created_at` and `id`, wrapped in a versioned payload and authenticated with HMAC-SHA-256. Invalid, altered, malformed or expired-by-key-rotation tokens are rejected with HTTP 400. Rotating the server signing key invalidates existing cursors, which clients can recover from by restarting pagination.

### Web client

- `src/lib/directory.ts` validates the API envelope and listing records.
- `src/App.tsx` uses TanStack Query's infinite-query cursor flow.
- Search, category and region changes form part of the query key and restart the result set.
- The client does not require a Supabase key for public directory reads.

## Not implemented yet

These remain separate follow-up work and are not implied by the current GET route:

- `POST /api/v1/reports` — requires an approved report table, retention policy, moderation workflow and abuse controls.
- `GET /api/v1/listings/{slug}` — individual listing detail route.
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

- Unit tests were added in `tests/directory-api.test.mjs` for filter validation, signed cursor integrity, malformed cursors and public response projection.
- These tests have **not been executed in this authoring environment**. A successful GitHub Actions run and a fresh Vercel preview are still required before claiming runtime/build validation.
- Supabase production schema and data were not changed.
- The proposed global-directory SQL remains under `supabase/proposed/`, not `supabase/migrations/`.
- VibeRaven static review is separate from live database testing; see the execution log.

## Security and privacy boundaries

The API is for public entities and public-facing resources, not a people-finder. It must not be extended to expose attendee lists, private group rosters, private contact details, home addresses, precise personal locations, private messages or sensitive personal data. Public individual profiles, if ever implemented, remain voluntary, adults-only, private by default and subject to explicit publication consent and a trusted eligibility workflow.
