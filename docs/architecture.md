# FurFinder Architecture

## Product architecture

FurFinder is a discovery and directory product, not a private social network or open chat platform. Public pages help visitors find public communities, events, creators, organizations, industry resources, and educational material.

## Delivery sectors

| Sector | Responsibility | Technology / integration |
|---|---|---|
| Web foundation | Semantic document structure and accessible UI | HTML, CSS, SVG, MathML where needed |
| Frontend MVP | Interactive discovery experience | React + TypeScript + Vite |
| Styling | Design tokens and responsive utility styling | CSS first; Tailwind can be introduced when the component system is stable |
| Rendering lab | Optional rich maps, 3D showcases, and visual experiments | Canvas, WebGL, WebGPU, Three.js, CSS Houdini; progressive enhancement only |
| Web framework evaluation | Compare static/content and server-rendered routes | Astro and Next.js evaluated as separate deployment candidates, not duplicate production shells |
| UI framework evaluation | Compatibility experiments for other ecosystems | Vue, Angular, Svelte kept in isolated examples until a real use case is approved |
| Application state | Local view state and query state | React state first; TanStack Query for server state; Recoil only if a concrete state graph justifies it |
| Backend/API | Domain services and integrations | Node.js first; Go, Rust, Java, Ruby, Python, Elixir are isolated service/lab options with explicit API contracts |
| Runtime experiments | Compare JavaScript runtimes | Node, Deno, and Bun tested in separate tooling or service tasks |
| Compute | Optional browser inference and portable compute | WebNN and WebAssembly behind feature detection |
| Desktop/mobile | Future companion clients | Electron and Dart/Flutter evaluated as separate clients; web remains the primary MVP |
| Data | Relational source of truth | PostgreSQL through Supabase |
| Operations | Repeatable builds and automation | Bash, Docker, GitHub Actions, Vercel |

## Integration contracts

- Browser-to-backend: HTTPS JSON APIs and typed request/response contracts.
- Backend-to-database: least-privilege database access; never expose service credentials to the browser.
- Identity: authenticated user identity is separate from listing verification status.
- Search: filters and ranking must be explainable and must not imply endorsement.
- Media: store only public assets with explicit upload rules and storage policies.

## Supabase security baseline

- Enable Row Level Security on exposed tables.
- Public/anonymous access is read-only and limited to approved published listings.
- Listing submissions are private to their submitter until reviewed.
- Only authorized moderators can approve, reject, or change verification status.
- Keep secret/service keys server-side.
- Test both allowed and denied access for anonymous, authenticated, submitter, and moderator roles.
- Treat verification as a recorded review event with reviewer, timestamp, evidence source, and outcome.

## Initial domain model (planned)

- profiles
- listings
- listing_categories
- listing_sources
- listing_reviews
- events
- event_locations
- creator_profiles
- organizations
- reports
- moderation_actions

This is a planned model, not an applied database migration.

## Safety and privacy

- No adult-content category or adult discovery flow.
- No public display of private addresses, personal phone numbers, or private accounts.
- Event venues should be official public venue details supplied by organizers.
- Add report, correction, and removal-request flows before accepting public submissions.
- Apply rate limits and moderation queues to prevent spam and impersonation.

## Current status

The repository currently has no Supabase project connected and no Vercel project found in the connected accounts. The first web scaffold can be developed independently; provider integration and deployment must wait until the appropriate project is connected.
