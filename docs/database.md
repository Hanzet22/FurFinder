# Supabase directory schema

Project: `furfinder` (Singapore region)

## Public directory

### `public.listings`

Stores directory entries for communities, conventions, artists, organizations, industry, and resources.

- `status`: `pending`, `published`, `rejected`, or `archived`.
- Anonymous and authenticated browser roles have only SELECT table access.
- RLS restricts public reads to rows where `status = 'published'`.
- Public INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER privileges remain revoked.
- `source_url` records the public source used for moderator verification.
- Website and source URLs are constrained to HTTPS.

The web browser never writes to this table. The Vercel `POST /api/v1/submissions` function uses a server-only Supabase secret after verifying the Turnstile token and request payload. It can only create a row with `status = 'pending'`, `is_featured = false`, and `verified_at = null`. It cannot set publication or featured status from user input.

## Moderation boundary

Pending rows are not publicly readable. The current review path is the Supabase Dashboard table editor: a moderator checks the official website and source, corrects metadata, and only then changes the status to `published`. Set `verified_at` when the source review is complete. A custom moderator console, role-management workflow, audit log, and distributed edge rate limiting are not implemented yet.

Do not expose a secret/service-role key in browser code, mobile bundles, URLs, or source control. Do not add anonymous write policies.

## Migrations

The initial directory and least-privilege grants are tracked in:

- `20261030130751_create_public_directory`
- `20261030132124_harden_public_listings_grants`

The submission API reuses the existing `pending` state and table; it does not require an additional table or privilege change. Public `anon` and `authenticated` grants remain SELECT-only.
