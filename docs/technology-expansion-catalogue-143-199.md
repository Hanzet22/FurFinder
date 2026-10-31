# FurFinder Technology Expansion Catalogue — Rounds 143–199

Date: 2026-10-31  
Baseline: `d50c3b392b510e7f383879576c4a8cc2dee9ef58`  
Scope: web platform, public API, Supabase, security, quality, observability and Flutter companion.

## Count and interpretation

This catalogue tracks **144 technology entries** across 12 capability groups. It is a selection and integration register, not a claim that every item is installed or enabled. Status is explicit:

- **Existing** — confirmed in the inspected repository or live architecture.
- **Planned / Designed / Target** — already an agreed product direction or a documented requirement, not necessarily runtime code.
- **Candidate / Evaluate / Later** — requires technical fit, cost, privacy, licensing and maintenance review.
- **Avoid for MVP** — intentionally excluded from the initial delivery.

Do not add dependencies simply to increase a count. Prefer browser/platform primitives and existing packages when they meet the requirement. Every new dependency needs a named owner, pinned version, lockfile update, license review, bundle impact, security review and test evidence.

## Existing stack confirmed

- Web: React 18, TypeScript, Vite 6, Tailwind CSS v4, TanStack Query v5 and Lucide React.
- API/runtime: Vercel Functions and Node.js.
- Data/auth: Supabase PostgreSQL, RLS, PostgREST and Supabase Auth for moderator workflows.
- Quality: Node test runner, TypeScript typecheck and GitHub Actions.
- Anti-abuse: Cloudflare Turnstile on the existing web submission path.
- Mobile: Flutter/Dart is the planned companion direction; no Flutter app is shipped in this baseline.

## Technology catalogue

## Web foundation

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | React 18 | Current UI runtime | Existing |
| 2 | TypeScript | Static type system | Existing |
| 3 | Vite 6 | Development and build tooling | Existing |
| 4 | Tailwind CSS v4 | Utility styling | Existing |
| 5 | TanStack Query v5 | Server-state cache and pagination | Existing |
| 6 | Lucide React | Icon system | Existing |
| 7 | React Router | Route composition if multi-page navigation expands | Evaluate |
| 8 | Zod | Runtime schema validation shared by UI and API | Evaluate |
| 9 | React Hook Form | Complex form state | Evaluate |
| 10 | Radix UI | Accessible headless primitives | Evaluate |
| 11 | Storybook | Isolated component catalogue | Later |
| 12 | CSS Modules | Scoped styling option | Evaluate |

## Web platform and offline

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Web App Manifest | Install metadata and app identity | Implemented in this branch; verification pending |
| 2 | Service Worker | Offline shell and controlled caching | Implemented in this branch; verification pending |
| 3 | Workbox | Service-worker lifecycle and cache strategies | Evaluate |
| 4 | IndexedDB | Structured local public-data cache | Candidate |
| 5 | Dexie.js | Typed IndexedDB wrapper | Evaluate |
| 6 | BroadcastChannel API | Cross-tab cache coordination | Evaluate |
| 7 | Cache Storage API | Static asset caching | Implemented in this branch; verification pending |
| 8 | Background Sync API | Deferred safe retry where supported | Later |
| 9 | Web Share API | Native share sheet enhancement | Candidate |
| 10 | Web Push | Opt-in public event reminders | Later |
| 11 | Web Vitals | Core performance measurement | Candidate |
| 12 | Intersection Observer | Lazy loading and progressive rendering | Candidate |

## Mobile application

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Flutter | Cross-platform mobile framework | Planned |
| 2 | Dart | Mobile application language | Planned |
| 3 | Riverpod | Predictable app state | Evaluate |
| 4 | go_router | Declarative navigation | Evaluate |
| 5 | Dio | HTTP client with interceptors | Evaluate |
| 6 | Freezed | Immutable models and unions | Evaluate |
| 7 | json_serializable | Typed JSON mapping | Evaluate |
| 8 | Drift | SQLite persistence | Evaluate |
| 9 | Hive CE | Lightweight local key-value storage | Evaluate |
| 10 | flutter_secure_storage | Secure storage for auth tokens if ever needed | Evaluate |
| 11 | connectivity_plus | Connectivity hints | Evaluate |
| 12 | intl | Localization and date formatting | Evaluate |
| 13 | flutter_local_notifications | Local opt-in reminders | Later |
| 14 | flutter_test | Widget and unit tests | Planned |

## API and integration

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Vercel Functions | Same-origin API runtime | Existing |
| 2 | Node.js | Server runtime | Existing |
| 3 | Supabase Auth | Moderator identity | Existing |
| 4 | Supabase PostgREST | Database access layer | Existing |
| 5 | OpenAPI 3.1 | Versioned API contract | Candidate |
| 6 | JSON Schema | Portable payload contracts | Candidate |
| 7 | HMAC-SHA-256 | Signed cursor integrity | Existing |
| 8 | Cloudflare Turnstile | Submission anti-abuse check | Existing |
| 9 | Upstash Redis | Distributed rate limiting and short-lived counters | Evaluate |
| 10 | OAuth 2.1 PKCE | Mobile sign-in only if a real account feature is approved | Later |
| 11 | Webhooks | Verified event notifications | Later |
| 12 | Server-Sent Events | Live moderation status only if justified | Later |

## Database and search

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | PostgreSQL | Primary relational database | Existing |
| 2 | Row Level Security | Row-level authorization | Existing |
| 3 | SQL migrations | Versioned schema changes | Existing |
| 4 | Generated TypeScript database types | Typed query boundaries | Candidate |
| 5 | PostgreSQL Full Text Search | Language-aware directory search | Evaluate |
| 6 | pg_trgm | Typo-tolerant matching | Evaluate |
| 7 | GIN indexes | Search index strategy | Evaluate |
| 8 | Keyset pagination | Stable bounded list traversal | Existing |
| 9 | PostGIS | Geospatial queries; not for personal tracking | Avoid for MVP |
| 10 | pgvector | Semantic search; only after quality and privacy review | Later |
| 11 | Supabase Storage | Public assets only with licensing checks | Evaluate |
| 12 | Supabase Realtime | Potential moderator queue refresh | Evaluate |

## Security and privacy

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Content Security Policy | Restrict executable and resource origins | Candidate |
| 2 | Strict-Transport-Security | HTTPS transport policy | Configured in this branch; preview verification pending |
| 3 | Referrer-Policy | Limit cross-site referrer leakage | Configured in this branch; preview verification pending |
| 4 | Permissions-Policy | Disable unneeded browser capabilities | Configured in this branch; preview verification pending |
| 5 | CSRF tokens | Protect cookie-authenticated mutations | Evaluate |
| 6 | CORS allowlist | Restrict cross-origin API use | Existing policy review |
| 7 | SSRF URL validation | Constrain source URL handling | Candidate |
| 8 | DOMPurify | Sanitize untrusted rich text if HTML rendering is introduced | Evaluate |
| 9 | XML parser hardening | Disable DTD and external entity resolution | Designed |
| 10 | Secret scanning | Prevent credential commits | Candidate |
| 11 | Dependabot | Dependency update alerts | Candidate |
| 12 | CodeQL | Static code security analysis | Candidate |

## Testing and quality

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Node.js test runner | Current unit test runner | Existing |
| 2 | TypeScript typecheck | Static correctness gate | Existing |
| 3 | Vitest | Vite-native test expansion option | Evaluate |
| 4 | Playwright | Browser end-to-end tests | Candidate |
| 5 | MSW | Deterministic API mocking | Evaluate |
| 6 | axe-core | Automated accessibility checks | Candidate |
| 7 | Lighthouse CI | Performance and accessibility budgets | Candidate |
| 8 | Pa11y | Accessibility smoke tests | Evaluate |
| 9 | k6 | API load testing | Later |
| 10 | Autocannon | Node HTTP load testing | Evaluate |
| 11 | Pact | Consumer/provider contract tests | Later |
| 12 | OWASP ZAP | DAST on authorized preview environments | Evaluate |
| 13 | Flutter integration_test | Mobile end-to-end coverage | Planned |
| 14 | Golden Toolkit | Flutter visual regression | Evaluate |

## Observability and analytics

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Sentry | Error and performance monitoring | Evaluate |
| 2 | OpenTelemetry | Vendor-neutral traces and metrics | Evaluate |
| 3 | Vercel Analytics | Privacy-conscious web usage metrics | Evaluate |
| 4 | Vercel Speed Insights | Field performance data | Evaluate |
| 5 | Structured JSON logs | Consistent server diagnostics | Candidate |
| 6 | Correlation IDs | Trace a request across functions | Candidate |
| 7 | PostHog | Product analytics; consent and minimization required | Later |
| 8 | Uptime checks | Availability monitoring | Candidate |
| 9 | Status page | Public incident communication | Later |
| 10 | Alert routing | Actionable operational notifications | Later |

## Delivery and supply chain

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | GitHub Actions | CI automation | Existing |
| 2 | npm lockfile | Reproducible dependency resolution | Existing |
| 3 | Renovate | Automated dependency PRs | Evaluate |
| 4 | OSV-Scanner | Known-vulnerability scanning | Candidate |
| 5 | Socket | Package supply-chain risk signals | Evaluate |
| 6 | OpenSSF Scorecard | Repository security posture checks | Evaluate |
| 7 | SBOM (CycloneDX) | Software bill of materials | Candidate |
| 8 | SLSA provenance | Build provenance | Later |
| 9 | Docker | Reproducible local service testing | Evaluate |
| 10 | Changesets | Coordinated package release notes | Later |
| 11 | Release Please | Automated release PRs | Later |
| 12 | Vercel Preview Deployments | Isolated preview validation | Existing |

## Accessibility and localization

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | WCAG 2.2 | Accessibility target | Target |
| 2 | WAI-ARIA | Semantic interaction support | Candidate |
| 3 | axe DevTools | Manual/assisted accessibility review | Evaluate |
| 4 | i18next | Web localization | Evaluate |
| 5 | FormatJS | ICU message formatting | Evaluate |
| 6 | ICU MessageFormat | Plural and locale-aware messages | Candidate |
| 7 | Unicode NFC | Normalize multilingual search input | Existing |
| 8 | RTL layout support | Right-to-left language readiness | Later |
| 9 | Reduced Motion | Respect user motion preferences | Candidate |
| 10 | Text scaling | Responsive readable typography | Candidate |
| 11 | Keyboard navigation | Full keyboard interaction | Target |
| 12 | Screen-reader semantics | Assistive-technology support | Target |

## Discovery, content and interoperability

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Firecrawl | Candidate source discovery and research | Existing research tool |
| 2 | RSS 2.0 | Public source update feeds | Evaluate |
| 3 | Atom | Alternative public update feeds | Evaluate |
| 4 | iCalendar (RFC 5545) | Public event date interoperability | Evaluate |
| 5 | Schema.org | Structured public entity metadata | Candidate |
| 6 | JSON-LD | Search-engine structured metadata | Candidate |
| 7 | Open Graph | Link preview metadata | Candidate |
| 8 | Canonical URLs | Stable listing identity | Candidate |
| 9 | XML 1.0 | Allowlisted import format | Designed |
| 10 | Sitemap XML | Public directory indexing | Candidate |
| 11 | robots.txt | Crawler access guidance | Candidate |
| 12 | HTTP ETag | Conditional GET and cache validation | Candidate |

## Mobile and web release tooling

| # | Technology | Purpose | Status |
|---:|---|---|---|
| 1 | Android Gradle Plugin | Android build pipeline | Planned |
| 2 | Gradle | Android build orchestration | Planned |
| 3 | Android App Bundles | Play distribution format | Planned |
| 4 | Fastlane | Mobile release automation | Evaluate |
| 5 | Firebase Crashlytics | Mobile crash reporting | Evaluate |
| 6 | Firebase App Distribution | Private Android beta distribution | Evaluate |
| 7 | Google Play Console | Android store release workflow | Planned |
| 8 | Apple App Store Connect | iOS store release workflow | Planned |
| 9 | TestFlight | iOS beta testing | Planned |
| 10 | Flutter flavors | Separate dev/staging/prod app configs | Evaluate |

## Integration rules

1. Preserve published-only public reads and same-origin API boundaries.
2. Keep Supabase secret/service-role credentials server-side. Never bundle them into web or mobile clients.
3. Do not expose moderator tables, source provenance internals, report contents or audit evidence to public clients.
4. No precise/background location, attendee discovery, private member rosters, unsolicited messaging or public profiles for minors.
5. Public listing caches may contain only published public fields and must show stale/offline state clearly.
6. Event reminders, analytics, push and mobile permissions require explicit opt-in and a privacy review.
7. Source discovery is not publication authority. Firecrawl/RSS/calendar results remain candidate evidence until a human moderator verifies the organizer source and terms.
8. Do not republish artwork, logos, photos or other media merely because a URL is public.
9. Do not run database migrations, DDL or production data writes as part of technology selection.
10. Do not claim WCAG conformance, mobile release readiness or deployment success without the corresponding manual and automated evidence.

## Recommended implementation order

- Wave A: security headers, generated API contracts, browser PWA shell, accessibility and end-to-end tests.
- Wave B: API rate limiting, structured logs, error monitoring and database search evaluation.
- Wave C: Flutter read-only MVP, offline public cache, deep links, widget/integration tests.
- Wave D: event interoperability, opt-in notifications, analytics and advanced search only after consent, legal and operational review.

## Acceptance gate for each integration

- A concrete user problem and measurable acceptance criteria exist.
- Official documentation and current compatibility are checked.
- Dependency is maintained, pinned and license-compatible.
- No secret, private data or privileged access is exposed.
- Unit/integration/security/accessibility tests are added where applicable.
- Performance and bundle impact are measured.
- Rollback/removal path is documented.
- Status is recorded as implemented, tested, preview-verified or production-approved; these are not interchangeable.


## Official technical references

- [MDN: PWA caching strategies](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) — cache freshness depends on resource type; avoid caching requests that should remain live or mutations.
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — service workers intercept controlled requests and can serve cached responses.
- [Vercel: Response headers](https://vercel.com/docs/headers/response-headers) — response headers can be inspected with browser developer tools or an HTTP client.
- [Flutter: Offline-first support](https://docs.flutter.dev/app-architecture/design-patterns/offline-first) — repositories should be the single source of truth across local and remote data.
