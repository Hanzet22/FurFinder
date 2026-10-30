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

The responsive web MVP uses Vite, React, and TypeScript, with TanStack Query managing published-directory state and caching. Tailwind CSS v4 utilities run alongside the existing CSS design system. Supabase PostgreSQL remains the source of truth; the browser can read published listings only. Vercel Node.js Functions now provide API health and a protected listing-submission route. That route validates payloads, verifies Cloudflare Turnstile server-side, and creates pending listings using a server-only Supabase secret. Public database roles remain SELECT-only. The XML v1 contract exists; its importer is still planned.

## Development

```bash
npm install
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
- [ ] Authentication and role model
- [x] Pending submission queue and manual moderator review in Supabase Dashboard
- [ ] In-app moderator console and role-management UI
- [x] Polyglot technology matrix and staged implementation roadmap
- [x] Mobile companion product brief
- [x] Vercel deployment
- [x] Automated typecheck and production build in CI
- [ ] Distributed edge rate limiting, automated end-to-end tests, and full launch review

See [docs/architecture.md](docs/architecture.md) for system architecture, [docs/technology-roadmap.md](docs/technology-roadmap.md) for the complete polyglot technology matrix, [docs/mobile-app-prd.md](docs/mobile-app-prd.md) for the Flutter companion plan, [docs/database.md](docs/database.md) for the database and moderation boundary, and [contracts/README.md](contracts/README.md) for the XML import contract.

## Local environment

Copy `.env.example` to `.env.local` for browser settings. Run Vercel Functions locally with `vercel dev`. Configure `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and `SUPABASE_SECRET_KEY` in Vercel before enabling submissions. Never put a Supabase secret/service-role key in a Vite variable or browser bundle. See [docs/submissions.md](docs/submissions.md).
