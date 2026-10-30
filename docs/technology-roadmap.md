# FurFinder Polyglot Technology Matrix

This document is the implementation contract for the requested technology set. It separates production dependencies from isolated labs and future clients so that competing frameworks and runtimes do not collide inside one deployment.

## Rules

1. Every technology must have a named responsibility, owner module, acceptance test, and lifecycle status.
2. Production dependencies are selected by the product need, not by a requirement to maximize framework count.
3. Alternative frameworks and runtimes run in isolated workspaces with independent lockfiles and CI jobs.
4. No technology is marked implemented until code exists and its build or test is recorded.
5. The browser client remains safe for minors: public discovery only, no adult-content discovery, private-location exposure, or unmoderated contact features.
6. Languages, markup, query languages, data formats, frameworks, runtimes and infrastructure tools are tracked as distinct kinds of technology.
7. New services must justify operational cost and must use versioned contracts; a language catalog is not a mandate to deploy every runtime.

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
| Node.js | Versioned server-side APIs and trusted moderation boundary | Vercel Functions in `api/v1` | Active (health, listing intake, moderator queue and review) |
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
| C | Low-level native utilities and portable parser experiments | `labs/native-c` | Planned |
| C++ | High-performance media, geometry and native integration experiments | `labs/native-cpp` | Planned |
| C# | Optional .NET tooling, desktop utilities and interoperability experiments | `labs/dotnet` | Planned |
| Kotlin | Native Android features and platform-specific Flutter plugins | `apps/android-kotlin` | Planned |
| Swift | Native iOS integrations where Flutter plugins are insufficient | `apps/ios-swift` | Planned |
| PHP | Compatibility/import adapter experiments for partner systems | `services/import-php` | Evaluation |
| Lua | Small embedded scripting and configurable transformation experiments | `labs/lua` | Evaluation |
| Perl | Legacy feed-cleanup and text-processing interoperability | `labs/perl` | Evaluation |
| R | Statistical analysis of aggregate, non-identifying directory quality metrics | `services/analytics-r` | Planned |
| Julia | Numerical and performance research for non-personal aggregate datasets | `labs/julia` | Evaluation |
| Scala | JVM data-pipeline interoperability evaluation | `labs/scala` | Evaluation |
| Haskell | Typed parser and data-contract correctness research | `labs/haskell` | Evaluation |
| Erlang | Reliability comparison for supervised background processing | `labs/erlang` | Evaluation |
| Clojure | Data transformation and JVM interoperability experiment | `labs/clojure` | Evaluation |
| F# | Typed .NET data-processing experiment | `labs/fsharp` | Evaluation |
| Zig | Small native/WASM utility and C interoperability experiment | `labs/zig` | Evaluation |
| Objective-C | Legacy Apple SDK interoperability only | `labs/apple-interop` | Evaluation |
| PowerShell | Windows developer and release automation scripts | `scripts/powershell` | Planned |
| SQL | Queries, constraints, views and reviewed database migrations | Supabase PostgreSQL | Active |
| GraphQL | Optional typed aggregation API evaluation; not a replacement for REST v1 by default | `labs/graphql` | Evaluation |
| Protocol Buffers | Compact, versioned contracts for future internal service boundaries | `packages/contracts/protobuf` | Planned |
| JSON Schema | Runtime validation for public API and import payloads | `packages/contracts/json-schema` | Planned |
| YAML | CI workflows and declarative configuration | `.github/workflows` | Active |
| TOML | Tool and package configuration where supported | Repository tooling | Active / expand |
| Markdown | Product, contributor, API and operational documentation | `docs` | Active |
| Redis / Valkey | Optional ephemeral cache, queue coordination or rate-limit counters | `infra/cache` | Evaluation |
| Meilisearch | Typo-tolerant directory search evaluation | `services/search-meilisearch` | Evaluation |
| Typesense | Alternative search engine benchmark against PostgreSQL search | `labs/search-typesense` | Evaluation |
| OpenSearch | Large-scale search and analytics option only if dataset size warrants it | `labs/search-opensearch` | Evaluation |
| PostGIS | Region and public venue geospatial queries without exposing private locations | Supabase PostgreSQL extension | Evaluation |
| pgvector | Similarity search for opt-in public content discovery, never sensitive profiling | Supabase PostgreSQL extension | Evaluation |
| OpenAPI | Machine-readable REST API contract and generated client validation | `packages/contracts/openapi` | Planned |
| gRPC | Typed internal service communication if separate services become necessary | `packages/contracts/grpc` | Evaluation |
| Terraform / OpenTofu | Reviewable infrastructure-as-code for repeatable environments | `infra/iac` | Planned |
| Kubernetes | Container orchestration only if service scale and operations justify it | `infra/kubernetes` | Evaluation |
| Helm | Versioned Kubernetes deployment templates if Kubernetes is adopted | `infra/helm` | Evaluation |
| OpenTelemetry | Standard traces, metrics and logs across API boundaries | `packages/observability` | Planned |
| Sentry | Error aggregation with PII scrubbing and safe release metadata | Web/API observability | Evaluation |
| Playwright | Browser end-to-end and accessibility smoke tests | `tests/e2e` | Planned |
| Vitest | Fast isolated web unit/component tests | Web client CI | Planned |
| Storybook | Isolated component catalogue and visual review | `apps/storybook` | Planned |
| axe-core | Automated accessibility checks for web components and routes | `tests/accessibility` | Planned |
| Lighthouse | Performance, accessibility and best-practice regression checks | CI / release checks | Planned |
| Renovate | Dependency update proposals with CI validation | Repository automation | Planned |
| Trivy | Container and dependency vulnerability scanning | CI / container pipeline | Planned |
| Semgrep | Static analysis for common application security mistakes | CI security checks | Planned |
| MapLibre GL | Optional public map rendering with coarse region defaults | `packages/maps` | Evaluation |
| Leaflet | Lightweight map alternative for public event/region maps | `packages/maps` | Evaluation |
| PWA / Service Workers | Installable web experience and controlled static/offline caching | Web client | Planned |
| WebAuthn / Passkeys | Phishing-resistant sign-in option for staff accounts | Auth evaluation | Planned |
| OpenID Connect (OIDC) | Standardized identity-provider integration | Auth boundary | Planned |
| ICU MessageFormat | Pluralization and localization-ready message formatting | `packages/i18n` | Planned |
| Firebase Cloud Messaging / APNs | Optional opt-in operational notifications, never unsolicited contact | `services/notifications` | Evaluation |
| S3-compatible object storage | Publicly approved media and import artifacts with strict access policies | `infra/object-storage` | Evaluation |

## Language and format classification

- **General-purpose / systems languages:** C, C++, C#, Clojure, Dart, Elixir, Erlang, F#, Go, Haskell, Java, JavaScript, Julia, Kotlin, Lua, Objective-C, Perl, PHP, PowerShell, Python, R, Ruby, Rust, Scala, Swift, TypeScript, Zig.
- **Query and API contract languages:** SQL, GraphQL, Protocol Buffers, OpenAPI.
- **Markup and data/configuration formats:** HTML, CSS, MathML, Markdown, JSON, JSON Schema, XML, YAML, TOML, SVG.
- **Runtimes, frameworks and platforms:** Node.js, Deno, Bun, React, Vue, Angular, Svelte, Astro, Next.js, Flutter, Electron, WebAssembly.
- **Infrastructure, quality and operations:** Docker, Terraform/OpenTofu, Kubernetes, Helm, OpenTelemetry, Playwright, Vitest, Storybook, axe-core, Lighthouse, Renovate, Trivy, Semgrep.

The catalog is intentionally broad. It does not mean every item belongs in the production dependency graph. Each candidate must pass the quality gates below and earn a concrete use case.

## Suggested workspace layout

```text
apps/
  web/                 # existing Vite + React + TypeScript client
  knowledge-astro/     # public knowledge hub
  next-evaluation/     # SSR/API evaluation, not a second production homepage
  mobile-flutter/      # Dart / Flutter client
  desktop-electron/   # desktop companion
  android-java/        # native Android integration experiments
  android-kotlin/      # Kotlin platform integration experiments
  ios-swift/           # Swift platform integration experiments
services/
  api-node/
  data-python/
  import-ruby/
  search-go/
  index-rust/
  events-elixir/
  analytics-r/
packages/
  contracts/
  data-contracts/xml/
  ui-tailwind/
  visual-lab/
  wasm/
  observability/
labs/
  webgpu/
  webnn/
  css-houdini/
  vue-client/
  angular-admin/
  svelte-widget/
  deno-runtime/
  state-management/
  native-c/
  native-cpp/
  dotnet/
  graphql/
  search-typesense/
tools/
  bun/
scripts/
infra/
  docker/
  iac/
docs/
tests/
  e2e/
  accessibility/
```

This is a target layout, not a claim that all directories or services already exist. Create a workspace only when its first executable module and tests are ready.

## Delivery phases

### Phase 0 — stable core (current)
- Keep Vite + React + TypeScript as the single production web shell.
- Keep Supabase PostgreSQL as the source of truth.
- Establish shared API/data contracts, environment validation, CI and accessibility baseline.
- Do not add competing frameworks to the production bundle.

### Phase 1 — core platform
- Node.js Vercel Functions now provide health, protected listing intake, and Supabase Auth-verified moderation queue/review APIs.
- The moderator desk uses a server-side allowlist and atomic audit log. First-admin bootstrap requires a confirmed email; a partial unique index enforces one active admin.
- Focused Node built-in tests cover listing submission validation and pending-record invariants; CI runs them after the build.
- Add Node.js API boundaries, XML import/export contract, TanStack Query and Tailwind design tokens. TanStack Query and the Tailwind utilities layer are now integrated in the web client.
- Add Docker-based local development, Bash scripts and contract tests.
- OpenAPI 3.1 and JSON Schema 2020-12 contracts now describe the published-only REST v1 response; a dependency-free Node validator checks the schema/fixture in the production build.
- Build listing provenance, review records, moderation roles and reporting before public submissions.

### Phase 2 — content and mobile
- Add Astro knowledge hub with MathML support.
- Build Flutter/Dart mobile client and evaluate Java/Kotlin Android and Swift iOS integration only for native platform capabilities.
- Evaluate Next.js separately for server-rendered routes; retain Vite unless measured benefits justify migration.
- Add ICU-based localization and PWA behavior after core navigation and accessibility stabilize.

### Phase 3 — polyglot services
- Build Python data-quality tooling, Ruby import worker, Go search/index API, Rust parser/WASM module, and Elixir event processing as independently deployable services.
- Evaluate C/C++, C#, PHP, R and other language options only against a concrete module requirement.
- Benchmark PostgreSQL search before adopting Meilisearch, Typesense, OpenSearch, Redis/Valkey, PostGIS or pgvector.
- Define OpenAPI/JSON contracts and failure behavior before connecting each service.
- Do not split services merely to check off language names.

### Phase 4 — visual and framework labs
- Add Canvas/SVG/Three.js visual components, WebGL fallback, WebGPU progressive enhancement, WebNN feature detection, and CSS Houdini experiments.
- Add isolated Vue, Angular and Svelte interoperability examples.
- Compare Deno and Bun in isolated tasks; keep Node.js as the first API runtime.
- Evaluate Recoil only in a contained state-management comparison.
- Evaluate MapLibre/Leaflet for public maps only; default to coarse regions and official public venues.

### Phase 5 — desktop and release hardening
- Add Electron desktop companion only if moderation/research workflows need it.
- Add Playwright, Vitest, Storybook and automated accessibility checks as maintainable test coverage grows.
- Introduce OpenTelemetry and Sentry only with PII scrubbing, retention limits and access controls.
- Add Terraform/OpenTofu and container scanning before expanding deployment infrastructure.
- Kubernetes/Helm remain optional until independent services and operational staffing justify them.

## Quality gates for every module

- A README explains why the technology exists and how to run it.
- The module has a typed contract and at least one automated test.
- CI builds/tests it without breaking the main web client.
- No secrets are bundled into browser/mobile artifacts.
- Data access follows least privilege and RLS.
- User-submitted records require server validation, anti-bot verification, provider-level rate limiting, source provenance and moderation.
- Unsupported browser capabilities have a tested fallback.
- Performance cost is measured before a module ships to all users.
- Telemetry must redact tokens, private contact details, precise personal locations and message content.
- Search, maps and analytics must not infer or expose sensitive personal attributes.

## Explicit non-goals

- Do not load every framework into one page.
- Do not run every language as a network microservice without a real boundary.
- Do not duplicate the production database or create competing sources of truth.
- Do not treat a technology roadmap as proof of implementation.
- Do not collect private location, private contact or behavioral-profile data to power search or analytics.
