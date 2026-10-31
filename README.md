# FurFinder — FINDER GLOBAL

A global discovery platform for the furry community.

FurFinder helps people discover furry communities, conventions, artists and creators, organizations, makers, studios, and industry resources across countries and regions.

## Product pillars

- **Communities** — discover public furry communities and their official entry points.
- **Conventions** — find furry conventions, meets, and community events.
- **Artists & Creators** — explore portfolios, makers, studios, and creator profiles.
- **Organizations** — discover associations, groups, and community organizations.
- **Industry** — explore manufacturers, merchandise, production, technology, and services.
- **Knowledge** — access guides, public resources, and community information.

## Principles

1. Source transparency: listings should show where information came from and when it was checked.
2. Verification: distinguish verified, community-submitted, and unverified listings.
3. Privacy: never expose private contact details or precise personal locations by default.
4. Minor safety: public discovery only; no adult-content discovery, solicitation, or unsafe contact flows.
5. Accessibility: responsive layouts, keyboard support, readable contrast, and reduced-motion support.
6. Global access: design for localization, regional discovery, and low-bandwidth devices.

## Current implementation

The responsive web MVP uses Vite, React, and TypeScript, with TanStack Query managing published-directory state and caching. Tailwind CSS v4 utilities run alongside the existing CSS design system. Supabase PostgreSQL remains the source of truth; the browser can read published listings only. Vercel Node.js Functions provide API health, protected listing intake, and an authenticated moderation API. The moderation desk at `/moderation` verifies Supabase Auth sessions server-side, checks a server-only moderator allowlist, and records publish/reject decisions atomically with an audit event. Public database roles remain read-only; elevated credentials stay on the server. The XML v1 contract exists; its trusted importer is still planned.

## Development

```bash
npm install
npm test
npm run dev
```

## Project status

- [x] Repository foundation
- [x] Product scope and safety principles
- [x] Responsive discovery UI
- [x] Supabase project and initial directory schema
- [x] Public read-only directory API with RLS and least-privilege grants
- [x] Runtime validation for public listing responses
- [x] TanStack Query cache for published directory data
- [x] Tailwind CSS v4 utility layer integrated with existing CSS
- [x] Node.js API functions for health and moderated listing suggestions
- [ ] Trusted XML importer
- [x] XML v1 import contract and example
- [x] Supabase Auth sign-in and server-side moderator allowlist
- [x] Pending submission queue and manual moderator review in Supabase Dashboard
- [x] In-app pending review console and atomic moderation audit log\n- [x] In-app moderator role-management UI for reviewer access (admin protected)
- [x] Polyglot technology matrix and staged implementation roadmap
- [x] Mobile companion product brief
- [x] Vercel deployment
- [x] Automated request-body unit tests, typecheck, and production build in CI
- [x] Streaming byte limits for listing submissions and moderation review requests
- [x] Directory pagination with a load-more control
- [ ] Distributed edge rate limiting, automated end-to-end tests, and full launch review

See [docs/architecture.md](docs/architecture.md) for system architecture, [docs/technology-roadmap.md](docs/technology-roadmap.md) for the complete polyglot technology matrix, [docs/mobile-app-prd.md](docs/mobile-app-prd.md) for the Flutter companion plan, [docs/database.md](docs/database.md) for the database security boundary, [docs/submissions.md](docs/submissions.md) for listing intake, [docs/moderation.md](docs/moderation.md) for staff setup, and [contracts/README.md](contracts/README.md) for the XML import contract.

## Local environment

Copy `.env.example` to `.env.local` for browser settings. Run Vercel Functions locally with `vercel dev`. Configure `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and `SUPABASE_SECRET_KEY` in Vercel before enabling submissions. For moderator access, create a Supabase Auth user and follow [docs/moderation.md](docs/moderation.md) for the one-time admin bootstrap. Never put a Supabase secret/service-role key in a Vite variable or browser bundle. See [docs/submissions.md](docs/submissions.md).
