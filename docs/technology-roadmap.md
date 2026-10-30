# FurFinder Polyglot Technology Matrix

This document is the implementation contract for the requested technology set. It separates production dependencies from isolated labs and future clients so that competing frameworks and runtimes do not collide inside one deployment.

## Rules

1. Every technology must have a named responsibility, owner module, acceptance test, and lifecycle status.
2. Production dependencies are selected by the product need, not by a requirement to maximize framework count.
3. Alternative frameworks and runtimes run in isolated workspaces with independent lockfiles and CI jobs.
4. No technology is marked implemented until code exists and its build or test is recorded.
5. The browser client remains safe for minors: public discovery only, no adult-content discovery, private-location exposure, or unmoderated contact features.

## Technology matrix

| Technology | FurFinder responsibility | Placement | Status |
|---|---|---|---|
| XML | Interchange format for partner/import feeds | `packages/data-contracts/xml` | Planned |
| JavaScript | Browser behavior and small integration scripts | Web client and tooling | Active |
| Java | Optional Android/native integration service or SDK | `apps/android-java` | Planned |
| WebGPU | GPU-accelerated visual/compute experiments with fallback | `labs/webgpu` | Experimental |
| WebGL | Broadly supported 3D rendering fallback | `packages/visual-lab` | Planned |
| Canvas | Lightweight charts and interactive visualizations | `packages/visual-lab` | Planned |
| SVG | Icons, diagrams, maps and scalable illustrations | Web design system | Active / expand |
| WebNN | Browser inference experiments where supported | `labs/browser-ai` | Experimental |
| HTML | Semantic accessible document structure | Web client | Active |
| CSS | Tokens, layout, responsive and accessible styling | Web client | Active |
| CSS Houdini | Progressive-enhancement visual effects | `labs/css-houdini` | Experimental |
| Tailwind CSS | Utility layer for selected reusable components | Current Vite web client | Active (utilities layer configured) |
| Astro | Static public knowledge hub and SEO-oriented content | `apps/knowledge-astro` | Planned |
| Vue | Isolated integration/demo client for framework interoperability | `labs/vue-client` | Planned |
| Next.js | Optional server-rendered application/API evaluation | `apps/next-evaluation` | Planned |
| Vite | Current production web build and development server | `apps/web` (current root app) | Active |
| Node.js | Versioned server-side APIs and tooling runtime | Vercel Functions in `api/v1` | Active (health and protected listing intake endpoints) |
| TypeScript | Shared types and current web application | `apps/web`, `packages/contracts` | Active |
| Ruby | Import/normalization worker experiment | `services/import-ruby` | Planned |
| Python | Data quality, moderation-assist and offline analysis jobs | `services/data-python` | Planned |
| React | Current interactive web client | `apps/web` | Active |
| Angular | Isolated admin-console architecture evaluation | `labs/angular-admin` | Planned |
| Svelte | Lightweight embedded widget / client evaluation | `labs/svelte-widget` | Planned |
| Deno | Edge/runtime compatibility and scheduled-task experiment | `labs/deno-runtime` | Planned |
| Bun | Fast local tooling and test-runner comparison | `tools/bun` | Planned |
| Electron | Desktop research/moderation companion, no private user data by default | `apps/desktop-electron` | Planned |
| Dart | Flutter mobile client for Android/iOS | `apps/mobile-flutter` | Planned |
| MathML | Accessible mathematical/technical content in knowledge pages | Astro knowledge hub | Planned |
| Three.js | 3D exhibit and creator showcase, opt-in and lazy-loaded | `packages/visual-lab` | Planned |
| Bash | Reproducible setup, validation and release scripts | `scripts` | Planned |
| WebAssembly | Portable compute modules and parser sandbox | `packages/wasm` | Planned |
| Go | High-throughput indexing or API worker if load justifies it | `services/search-go` | Planned |
| Rust | Safe high-performance parsing/indexing core compiled natively or to WASM | `services/index-rust` | Planned |
| Elixir | Reliable event/notification processing, not an open chat system | `services/events-elixir` | Planned |
| TanStack | Server-state fetching/cache and typed table/query utilities | Current Vite web client | Active (published directory query/cache) |
| Recoil | State-management comparison lab only; adopt only if still maintained and justified | `labs/state-management` | Evaluation |
| PostgreSQL | Source of truth for directory, provenance and moderation records | Supabase | Active |
| Docker | Reproducible local services and isolated polyglot CI environments | `infra/docker` | Planned |

## Suggested workspace layout

```text
apps/
  web/                 # existing Vite + React + TypeScript client
  knowledge-astro/     # public knowledge hub
  next-evaluation/     # SSR/API evaluation, not a second production homepage
  mobile-flutter/      # Dart / Flutter client
  desktop-electron/   # desktop companion
  android-java/        # native Android integration experiments
services/
  api-node/
  data-python/
  import-ruby/
  search-go/
  index-rust/
  events-elixir/
packages/
  contracts/
  data-contracts/xml/
  ui-tailwind/
  visual-lab/
  wasm/
labs/
  webgpu/
  webnn/
  css-houdini/
  vue-client/
  angular-admin/
  svelte-widget/
  deno-runtime/
  state-management/
tools/
  bun/
scripts/
infra/docker/
docs/
```

This is a target layout, not a claim that all directories or services already exist. Create a workspace only when its first executable module and tests are ready.

## Delivery phases

### Phase 0 — stable core (current)
- Keep Vite + React + TypeScript as the single production web shell.
- Keep Supabase PostgreSQL as the source of truth.
- Establish shared API/data contracts, environment validation, CI and accessibility baseline.
- Do not add competing frameworks to the production bundle.

### Phase 1 — core platform
- Add Node.js API boundaries, XML import/export contract, TanStack Query and Tailwind design tokens. TanStack Query and the Tailwind utilities layer are now integrated in the web client.
- Add Docker-based local development, Bash scripts and contract tests.
- Build listing provenance, review records, moderation roles and reporting before public submissions.

### Phase 2 — content and mobile
- Add Astro knowledge hub with MathML support.
- Build Flutter/Dart mobile client and evaluate Java Android integration only for native platform capabilities.
- Evaluate Next.js separately for server-rendered routes; retain Vite unless measured benefits justify migration.

### Phase 3 — polyglot services
- Build Python data-quality tooling, Ruby import worker, Go search/index API, Rust parser/WASM module, and Elixir event processing as independently deployable services.
- Define OpenAPI/JSON contracts and failure behavior before connecting each service.
- Do not split services merely to check off language names.

### Phase 4 — visual and framework labs
- Add Canvas/SVG/Three.js visual components, WebGL fallback, WebGPU progressive enhancement, WebNN feature detection, and CSS Houdini experiments.
- Add isolated Vue, Angular and Svelte interoperability examples.
- Compare Deno and Bun in isolated tasks; keep Node.js as the first API runtime.
- Evaluate Recoil only in a contained state-management comparison.

### Phase 5 — desktop and release hardening
- Add Electron desktop companion only if moderation/research workflows need it.
- Expand Docker/CI matrices, automated accessibility checks, end-to-end tests, observability and backup/restore drills.

## Quality gates for every module

- A README explains why the technology exists and how to run it.
- The module has a typed contract and at least one automated test.
- CI builds/tests it without breaking the main web client.
- No secrets are bundled into browser/mobile artifacts.
- Data access follows least privilege and RLS.
- User-submitted records require server validation, anti-bot verification, provider-level rate limiting, source provenance and moderation.
- Unsupported browser capabilities have a tested fallback.
- Performance cost is measured before a module ships to all users.

## Explicit non-goals

- Do not load every framework into one page.
- Do not run every language as a network microservice without a real boundary.
- Do not duplicate the production database or create competing sources of truth.
- Do not treat a technology roadmap as proof of implementation.
