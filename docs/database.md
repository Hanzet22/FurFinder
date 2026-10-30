# Supabase directory schema

Project: `furfinder` (Singapore region)

## Tables

### `public.listings`

Stores public directory entries for communities, conventions, artists, organizations, industry, and resources.

- `status`: `pending`, `published`, `rejected`, or `archived`.
- Public clients can only SELECT rows with `status = 'published'`.
- No public INSERT, UPDATE, or DELETE policy exists. Listing submissions and moderation must be handled by a trusted server-side workflow.
- `source_url` records the public source used for verification.
- Website and source URLs are constrained to HTTPS.

RLS is enabled. The `anon` and `authenticated` roles have SELECT grants; RLS limits visible rows to published listings.

## Moderation boundary

Do not expose service-role keys in browser code. Do not add anonymous write policies. Before accepting submissions, implement server-side validation, rate limiting, spam controls, and a moderator review process.

## Apply changes

The initial schema was applied as migration `create_public_directory`. Verify changes with Supabase migrations and advisors before adding further policies.
