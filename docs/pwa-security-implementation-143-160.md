# PWA and Web Security Implementation — Rounds 149–160

Status: implemented on feature branch; CI and preview verification pending.

## Web app manifest

- `public/manifest.webmanifest` defines FurFinder name, short name, scope, start URL, standalone display and theme colors.
- `public/favicon.svg` supplies the app's vector icon.
- `index.html` links the manifest and SVG icon.

This is a PWA foundation, not a claim that every browser will show an install prompt. Browser-specific installability checks and device validation remain required.

## Service worker

- Registered only in production builds by `src/lib/registerPwa.ts`.
- `public/sw.js` precaches the public shell: root, index, manifest and icon.
- Build assets under `/assets/` are cached on first successful fetch.
- Navigation uses network-first behavior and falls back to the cached root shell when offline.
- Old versioned shell caches are removed during activation.

## Privacy and authorization boundaries

The service worker explicitly bypasses:
- every non-GET request;
- cross-origin requests;
- all `/api/` routes;
- `/moderation` and `/moderation/` routes.

It does not cache listing API responses, submission requests, moderation pages, moderator data or any authenticated API payload. The cache is limited to public static app-shell resources and hashed build assets.

## Security response headers

`vercel.json` now configures:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

Content Security Policy is intentionally deferred until the complete script, style, image, font, API and anti-abuse origin inventory is tested. A premature CSP could break the application or its Turnstile flow.

## Automated tests

`tests/pwa.test.mjs` checks manifest identity and scope, verifies API/moderator cache exclusions, and checks that the service worker cache allowlist remains limited to the app shell and build assets.

## Remaining verification

- CI: pending exact-head GitHub Actions result.
- Preview response headers: pending; no matching Vercel preview has been deployed.
- Browser offline test: pending manual verification on desktop and Android.
- Install prompt and icon behavior: browser-specific validation pending.
- Moderator route isolation: automated source-level guard added; runtime browser verification pending.
