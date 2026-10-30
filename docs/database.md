# Supabase directory schema

Project: `furfinder` (Singapore region)

## Tables

### `public.listings`

Stores public directory entries for communities, conventions, artists, organizations, industry, and resources.

- `status`: `pending`, `published`, `rejected`, or `archived`.
- Public clients can only SELECT rows with `status = 'published'`.
- `anon` and `authenticated` have only the SELECT table privilege; RLS restricts visible rows to published entries.
- Public INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER privileges are revoked.
- `source_url` records the public source used for verification.
- Website and source URLs are constrained to HTTPS.

RLS is enabled. No anonymous write policy exists. Listing submissions and moderation must be handled by a trusted server-side workflow.

## Moderation boundary

Do not expose service-role keys in browser code. Do not add anonymous write policies. Before accepting submissions, implement server-side validation, rate limiting, spam controls, and a moderator review process.

## Migration history

- `20261030130751_create_public_directory`: baseline public directory table, constraints, RLS, and published-only read policy.
- `20261030132124_harden_public_listings_grants`: least-privilege table grants for public client roles.

The SQL files in `supabase/migrations` are the repository's migration record. Verify changes with Supabase advisors and live permission queries before adding further policies.
