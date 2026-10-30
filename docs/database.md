# Supabase directory and moderation schema

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

The web browser never writes to this table. The Vercel `POST /api/v1/submissions` function uses a server-only Supabase secret after verifying Turnstile and the request payload. It can only create rows with `status = 'pending'`, `is_featured = false`, and `verified_at = null`.

## Moderator-only tables

### `public.moderators`

- Maps a Supabase Auth `auth.users.id` to an active `admin` or `reviewer` role.
- RLS is enabled.
- Table privileges are revoked from `PUBLIC`, `anon`, and `authenticated`.
- Explicit RLS policies deny all browser reads and writes.
- Only the trusted server key can read or modify the allowlist.

### `public.moderation_events`

- Stores the listing ID, moderator user ID, decision, optional review note, and creation timestamp.
- RLS is enabled, and browser roles have no table privileges or row access.
- Audit rows are inserted by the database function in the same transaction as the listing status change.
- Foreign-key indexes support listing and moderator event history.

### `public.review_listing(...)`

This is a `SECURITY INVOKER` function with an empty search path. It checks that the supplied moderator is active, only accepts `publish` or `reject`, updates a listing only while its state is `pending`, and inserts the audit event atomically. Execute privilege is revoked from `PUBLIC`, `anon`, and `authenticated`; only `service_role` can execute it through the trusted server API.

The function does not permit a browser client to set `is_featured`, alter sources, or override a previously reviewed listing.

## Moderation boundary

The browser never queries the moderator tables or calls the privileged RPC directly. The server verifies the Supabase Auth access token against the Auth `/user` endpoint, checks active membership in `public.moderators`, and only then calls the review function with server credentials.

See [docs/moderation.md](moderation.md) for first-admin bootstrap, adding moderators, and API details.

## Migration history

- `20261030130751_create_public_directory`
- `20261030132124_harden_public_listings_grants`
- `20261030140921_create_moderator_console`
- `20261030140950_deny_browser_access_moderation_tables`
- `20261030141015_index_moderation_event_foreign_keys`

The original public `anon` and `authenticated` grants on `listings` remain SELECT-only. Moderator powers are server-side only.
