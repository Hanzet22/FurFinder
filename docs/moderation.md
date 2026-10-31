# FurFinder Moderator Console

The moderation desk is available at `/moderation`. It is a staff-only workspace for reviewing pending public listing suggestions.

## Access model

1. A moderator signs in through Supabase Auth using an existing email/password account.
2. The browser keeps the short-lived access/refresh session in tab-scoped `sessionStorage`; it is cleared on sign-out.
3. Every moderation API request sends the user access token to the Vercel function.
4. The function validates that token with Supabase Auth `GET /auth/v1/user`.
5. The function checks that the verified user ID has an active `admin` or `reviewer` row in `public.moderators`.
6. Only after those checks does the server use its secret key to read the pending queue or call the review RPC.

The browser never receives the Supabase secret key and has no direct SELECT/INSERT/UPDATE/DELETE privileges on `moderators` or `moderation_events`. It cannot execute `public.review_listing`.

## First administrator setup

1. In Supabase Dashboard, open Authentication > Users and create the first staff account with an email address you control. Confirm the account can sign in with email/password.
2. In the Vercel project, add `MODERATOR_BOOTSTRAP_EMAIL` as a server-only environment variable. Its value must exactly match the email on that Supabase Auth account. Do not prefix it with `VITE_`.
3. Confirm these server/browser variables are present in the same Vercel project:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (server-only; legacy `SUPABASE_SERVICE_ROLE_KEY` is supported)
   - `MODERATOR_BOOTSTRAP_EMAIL` (server-only, temporary)
4. Redeploy the project so the functions receive the new environment.
5. Open `https://furfinder-rho.vercel.app/moderation`, sign in with the first staff account, then choose **Set up first admin account**.
6. After the API confirms the first administrator was created, remove `MODERATOR_BOOTSTRAP_EMAIL` from Vercel and redeploy. The bootstrap endpoint will then remain disabled.

The bootstrap endpoint also checks that the moderator table is empty. It cannot add a second administrator once the first record exists. Do not leave the bootstrap email configured as a permanent access mechanism.

## Managing reviewer access

An active administrator can manage reviewers from the **Moderator access** panel in the moderation desk:

1. Open Supabase Dashboard → Authentication → Users and copy the user's UUID. The person must already have an Auth account.
2. In `/moderation`, sign in with an active administrator account.
3. Paste the UUID into **Supabase Auth user ID** and choose **Add reviewer**.
4. Use **Deactivate** or **Reactivate** to pause or restore an existing reviewer's access.

The in-app API only creates the `reviewer` role. It cannot create, deactivate, or demote an administrator; the admin row is shown as protected. Only active administrators can list and manage moderator records.

Do not use client-side user metadata or email claims as moderator authorization. The database allowlist is the authorization source.

## Review workflow

- Open both the official website and the supplied verification source.
- Confirm the entry represents a public community, convention, creator, organization, industry resource, or public resource.
- Do not approve private addresses, private phone numbers, private groups, or content that is not appropriate for general audiences.
- Record a short review note when useful.
- Choose **Publish listing** only after source checks are complete. The server records `verified_at` and changes status to `published`.
- Choose **Reject** when the source cannot be verified or the submission does not meet directory rules.

Each decision updates a row only when it is still `pending`. The database function writes the listing change and its audit event atomically. The review note and moderator UUID are retained in `public.moderation_events`.

## API routes

- `GET /api/v1/moderation/listings` — authenticated active moderators only; returns up to 100 pending records.
- `POST /api/v1/moderation/review` — authenticated active moderators only; accepts `listing_id`, `decision` (`publish` or `reject`), and an optional note up to 500 characters.
- `POST /api/v1/moderation/bootstrap` — one-time first-admin setup; requires a signed-in account whose email matches `MODERATOR_BOOTSTRAP_EMAIL` and an empty moderator table.
- `GET /api/v1/moderation/moderators` — active administrators only; lists moderator UUIDs, roles, active state, and creation time.
- `POST /api/v1/moderation/moderators` — active administrators only; adds an existing Auth user as a reviewer.
- `PATCH /api/v1/moderation/moderators` — active administrators only; activates or deactivates reviewer access. Administrator records are excluded from the update filter.

## Current limitations

- The in-app role-management screen uses Supabase Auth user UUIDs; it does not search Auth users by email.
- Supabase Auth MFA policy is not enforced by this release. Enable and require MFA for staff accounts in Supabase Auth before granting production moderator access.
- Distributed edge rate limiting and alerting for repeated failed sign-in or review requests remain launch-hardening tasks.
- This console reviews directory records only. It is not a chat, private contact, or user-to-user messaging system.
