# Listing submission API v1

## Flow

1. A visitor opens the inline suggestion form and enters public listing information only.
2. Cloudflare Turnstile creates a short-lived, single-use token.
3. The browser sends the JSON payload to `POST /api/v1/submissions` on the same origin.
4. The Vercel Node.js Function checks origin, content type, payload size, field lengths, category, region, HTTPS URLs, and the honeypot field.
5. The function validates the Turnstile token with Cloudflare Siteverify, including the expected action and request hostname.
6. The function uses a server-only Supabase secret to create a row in `public.listings` with `status = 'pending'`, `is_featured = false`, and `verified_at = null`.
7. The public directory remains read-only. The RLS policy exposes only `published` rows.

No email address, phone number, private address, or account profile is collected by this form.

## Vercel environment

Configure these variables in the Vercel project. Add server values as encrypted/sensitive variables, never as `VITE_*`:

| Variable | Where it is used | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser directory reader | Existing |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser directory reader | Existing |
| `VITE_TURNSTILE_SITE_KEY` | Browser challenge widget | Yes |
| `TURNSTILE_SECRET_KEY` | Server-side Siteverify validation | Yes |
| `SUPABASE_SECRET_KEY` | Server-side insert into pending listings | Yes |
| `SUPABASE_URL` | Server-side Supabase URL; falls back to `VITE_SUPABASE_URL` | Optional |

Use a new Supabase secret API key (preferred) in `SUPABASE_SECRET_KEY`, or the legacy `service_role` JWT in `SUPABASE_SERVICE_ROLE_KEY`. The function sends an opaque `sb_secret_*` key only as the `apikey` header; it sends a legacy JWT in both `apikey` and `Authorization: Bearer`. These credentials have elevated database access: keep them server-side and limit the route to creating a pending row. Never put them in source control, `.env.example` with real values, browser variables, or a mobile bundle.

Create a Cloudflare Turnstile widget for the production hostname `furfinder-rho.vercel.app` (and any other production hostname actually in use). The client sets the action to `listing_submission`; Siteverify must accept that action and the exact hostname. Preview deployments need their own Turnstile hostname configuration before their form can be used.

After adding variables, redeploy the Vercel project so the browser bundle receives the public site key and the server function receives its secrets.

## Verification endpoints

- `GET /api/v1/health` returns the API service/version health response.
- `POST /api/v1/submissions` accepts the form payload and returns a generic result. It does not return internal database errors.

When the Turnstile or Supabase server credentials are absent, submissions fail closed with HTTP 503 and the client form stays disabled if the public site key is missing.

## Moderation

Submissions use the existing `public.listings` table and its existing `pending` state. They do not create public rows visible to anonymous visitors. Review the pending queue in the Supabase Dashboard. A moderator must check the official website and source, correct metadata, and only then change the row to `published`; set `verified_at` when verification is completed. The current release has no custom moderator dashboard or role-management UI.

The API uses Turnstile, same-origin checks, a small request-body limit, field validation, and a honeypot. This is not a substitute for a distributed edge rate limit or a full moderation console; configure provider-level rate limiting before a high-traffic launch.
