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

The responsive web MVP uses Vite, React, and TypeScript. A Supabase PostgreSQL directory is connected through its publishable API key and row-level security. The public homepage reads only published listings; submissions and moderation are not open to anonymous clients.

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
- [x] Public read-only directory API with RLS
- [ ] Authentication and role model
- [ ] Moderation and verification workflows
- [x] Vercel deployment
- [x] Automated build and typecheck on initial CI baseline
- [ ] End-to-end tests and launch review

See [docs/architecture.md](docs/architecture.md) for the sector architecture and [docs/database.md](docs/database.md) for the database and moderation boundary.

## Local environment

Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key. Never place a Supabase service-role or secret key in a Vite environment variable or browser bundle.
