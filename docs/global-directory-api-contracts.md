# Global Directory API Contracts — Implementation Draft

**Status:** feature-branch design; not deployed.  
**Scope:** public entity directory, organizer-confirmed event metadata, and a separate adult opt-in profile projection.

## Public read contract

### `GET /api/v1/listings`
Query parameters:
- `q`: bounded text search (max 100 characters).
- `category`: one of the existing listing categories.
- `region`: one of the existing coarse region values.
- `country`: ISO 3166-1 alpha-2 code.
- `cursor`: opaque, server-generated continuation token.
- `limit`: integer 1–50; default 20.

Response envelope:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Public entity name",
      "slug": "public-entity",
      "category": "convention",
      "summary": "Public-facing summary",
      "region": "Asia-Pacific",
      "country_code": "TW",
      "website_url": "https://example.org",
      "verification_state": "source_checked",
      "last_verified_at": "2026-10-31T00:00:00Z",
      "event": {
        "starts_at": "2027-01-08T00:00:00Z",
        "ends_at": "2027-01-10T00:00:00Z",
        "timezone": "Asia/Tokyo",
        "venue_name": "Organizer-published venue",
        "event_status": "announced"
      }
    }
  ],
  "page": { "next_cursor": null, "has_more": false }
}
```

Only `published` listings may be returned. Do not return raw moderation notes, internal source eligibility notes, account identifiers, private contact details, attendee data or raw page captures.

### `GET /api/v1/listings/{slug}`
Returns the same allowlisted listing fields plus source attribution URLs that moderators have approved for public display. A third-party aggregator is not an official confirmation source.

### `GET /api/v1/profiles/{handle}`
Returns only explicitly published profiles whose trusted server-side adult-eligibility gate and current consent state are valid. Public fields: handle, short bio, optional country code and user-submitted public links. Never return email, account ID, DOB, verification evidence, consent logs or private moderation notes.

## Write contracts

### `POST /api/v1/submissions`
Creates a pending public entity submission. Validate bounded JSON body, HTTPS URLs, category allowlist, summary length, and duplicate candidates. It must never publish automatically.

### `POST /api/v1/reports`
Accepts a listing ID, enumerated report reason and bounded explanation. Rate-limit and keep reporter identity private.

### Profile lifecycle
- Profile creation is not available to minors.
- A profile is not public by default.
- Eligibility is verified by a trusted server-side workflow; client-supplied age booleans or timestamps are not accepted.
- Publication requires explicit consent to the exact public fields and a versioned consent statement.
- Unpublish/withdrawal takes effect immediately at the API layer.
- Deletion removes the public projection and follows a documented retention policy for legally necessary audit evidence.

## Pagination and reliability
- Use a stable keyset cursor (for example `created_at,id`) and sign/validate cursors server-side.
- Reject malformed, oversized or expired cursors.
- Enforce request timeouts, per-IP and per-account limits, and response field allowlists.
- Keep public search anonymous and read-only; never expose service-role credentials.
- Return consistent error envelopes and request IDs without leaking stack traces.

## Required tests
- Anonymous clients cannot read pending/rejected/archived listings.
- Anonymous clients cannot read source registry or provenance review notes.
- Event metadata is visible only when the parent listing is published.
- Public profiles require server-verified eligibility, consent and publication.
- Withdrawn/unpublished profiles disappear from anonymous reads immediately.
- One account cannot modify another account's profile.
- Cursor paging has no duplicates or omissions for a fixed dataset.
- Invalid filters, cursors and oversized bodies return safe 4xx responses.

## Release gate
This contract does not authorize production schema changes, profile launch, bulk ingestion or deployment. Add integration tests and review the SQL proposal before converting it into a timestamped Supabase migration.
