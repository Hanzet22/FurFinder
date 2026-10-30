# 92-Entry Technology Validation Matrix

Generated from `src/data/technology-catalog.json`. Last reviewed: 31 October 2026.

## Scope and honest status

The catalog contains **92 unique entries** across 7 categories. The catalog is not proof that all entries are installed or production-ready.

| Catalog status | Count |
|---|---:|
| Planned | 47 |
| Active | 10 |
| Experimental | 3 |
| Active / expand | 2 |
| Active (utilities layer configured) | 1 |
| Active (health, listing intake, moderator queue and review) | 1 |
| Active (published directory query/cache) | 1 |
| Evaluation | 27 |

Only technologies with an existing executable module can receive a runtime test. The current web application gets its ordinary TypeScript build and focused API checks. This does **not** compile or test every language listed below. Unimplemented candidates are explicitly marked as not executed rather than being given fake green results.

## Per-entry implementation and validation ledger

| Technology | Category | Intended placement | Catalog status | Minimal validation |
|---|---|---|---|---|
| XML | Languages & formats | packages/data-contracts/xml | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| JavaScript | Web & UI | Web client and tooling | Active | Existing production build/typecheck covers the integrated surface only |
| Java | Languages & formats | apps/android-java | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| WebGPU | Graphics & maps | labs/webgpu | Experimental | Not executed; create an isolated module and one compile/smoke check before activation |
| WebGL | Graphics & maps | packages/visual-lab | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Canvas | Graphics & maps | packages/visual-lab | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| SVG | Graphics & maps | Web design system | Active / expand | Existing production build/typecheck covers the integrated surface only |
| WebNN | Graphics & maps | labs/browser-ai | Experimental | Not executed; create an isolated module and one compile/smoke check before activation |
| HTML | Web & UI | Web client | Active | Existing production build/typecheck covers the integrated surface only |
| CSS | Web & UI | Web client | Active | Existing production build/typecheck covers the integrated surface only |
| CSS Houdini | Web & UI | labs/css-houdini | Experimental | Not executed; create an isolated module and one compile/smoke check before activation |
| Tailwind CSS | Web & UI | Current Vite web client | Active (utilities layer configured) | Existing production build/typecheck covers the integrated surface only |
| Astro | Web & UI | apps/knowledge-astro | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Vue | Web & UI | labs/vue-client | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Next.js | Web & UI | apps/next-evaluation | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Vite | Web & UI | apps/web (current root app) | Active | Existing production build/typecheck covers the integrated surface only |
| Node.js | Languages & formats | Vercel Functions in api/v1 | Active (health, listing intake, moderator queue and review) | Existing production build/typecheck covers the integrated surface only |
| TypeScript | Languages & formats | apps/web, packages/contracts | Active | Existing production build/typecheck covers the integrated surface only |
| Ruby | Languages & formats | services/import-ruby | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Python | Languages & formats | services/data-python | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| React | Web & UI | apps/web | Active | Existing production build/typecheck covers the integrated surface only |
| Angular | Web & UI | labs/angular-admin | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Svelte | Web & UI | labs/svelte-widget | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Deno | Languages & formats | labs/deno-runtime | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Bun | Languages & formats | tools/bun | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Electron | Mobile & platform | apps/desktop-electron | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Dart | Languages & formats | apps/mobile-flutter | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| MathML | Languages & formats | Astro knowledge hub | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Three.js | Graphics & maps | packages/visual-lab | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Bash | Languages & formats | scripts | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| WebAssembly | Languages & formats | packages/wasm | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Go | Languages & formats | services/search-go | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Rust | Languages & formats | services/index-rust | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Elixir | Languages & formats | services/events-elixir | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| TanStack | Web & UI | Current Vite web client | Active (published directory query/cache) | Existing production build/typecheck covers the integrated surface only |
| Recoil | Web & UI | labs/state-management | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| PostgreSQL | Data & APIs | Supabase | Active | Existing production build/typecheck covers the integrated surface only |
| Docker | Cloud & infrastructure | infra/docker | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| C | Languages & formats | labs/native-c | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| C++ | Languages & formats | labs/native-cpp | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| C# | Languages & formats | labs/dotnet | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Kotlin | Languages & formats | apps/android-kotlin | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Swift | Languages & formats | apps/ios-swift | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| PHP | Languages & formats | services/import-php | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Lua | Languages & formats | labs/lua | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Perl | Languages & formats | labs/perl | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| R | Languages & formats | services/analytics-r | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Julia | Languages & formats | labs/julia | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Scala | Languages & formats | labs/scala | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Haskell | Languages & formats | labs/haskell | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Erlang | Languages & formats | labs/erlang | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Clojure | Languages & formats | labs/clojure | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| F# | Languages & formats | labs/fsharp | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Zig | Languages & formats | labs/zig | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Objective-C | Languages & formats | labs/apple-interop | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| PowerShell | Languages & formats | scripts/powershell | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| SQL | Languages & formats | Supabase PostgreSQL | Active | Existing production build/typecheck covers the integrated surface only |
| GraphQL | Data & APIs | labs/graphql | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Protocol Buffers | Languages & formats | packages/contracts/protobuf | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| JSON Schema | Languages & formats | packages/contracts/json-schema | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| YAML | Languages & formats | .github/workflows | Active | Existing production build/typecheck covers the integrated surface only |
| TOML | Languages & formats | Repository tooling | Active / expand | Existing production build/typecheck covers the integrated surface only |
| Markdown | Languages & formats | docs | Active | Existing production build/typecheck covers the integrated surface only |
| Redis / Valkey | Data & APIs | infra/cache | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Meilisearch | Data & APIs | services/search-meilisearch | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Typesense | Data & APIs | labs/search-typesense | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| OpenSearch | Data & APIs | labs/search-opensearch | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| PostGIS | Data & APIs | Supabase PostgreSQL extension | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| pgvector | Data & APIs | Supabase PostgreSQL extension | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| OpenAPI | Data & APIs | packages/contracts/openapi | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| gRPC | Data & APIs | packages/contracts/grpc | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Terraform / OpenTofu | Cloud & infrastructure | infra/iac | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Kubernetes | Cloud & infrastructure | infra/kubernetes | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Helm | Cloud & infrastructure | infra/helm | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| OpenTelemetry | Quality & security | packages/observability | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Sentry | Quality & security | Web/API observability | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Playwright | Quality & security | tests/e2e | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Vitest | Quality & security | Web client CI | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Storybook | Quality & security | apps/storybook | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| axe-core | Quality & security | tests/accessibility | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Lighthouse | Quality & security | CI / release checks | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Renovate | Quality & security | Repository automation | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Trivy | Quality & security | CI / container pipeline | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Semgrep | Quality & security | CI security checks | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| MapLibre GL | Graphics & maps | packages/maps | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| Leaflet | Graphics & maps | packages/maps | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| PWA / Service Workers | Web & UI | Web client | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| WebAuthn / Passkeys | Quality & security | Auth evaluation | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| OpenID Connect (OIDC) | Quality & security | Auth boundary | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| ICU MessageFormat | Web & UI | packages/i18n | Planned | Not executed; create an isolated module and one compile/smoke check before activation |
| Firebase Cloud Messaging / APNs | Mobile & platform | services/notifications | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |
| S3-compatible object storage | Cloud & infrastructure | infra/object-storage | Evaluation | Not executed; create an isolated module and one compile/smoke check before activation |

## Minimal smoke-test contract for future modules

When a technology is activated, its first module must have one short, relevant smoke check:

- **Compiled languages:** compile a minimal module with the pinned toolchain and execute a trivial assertion.
- **Interpreted languages / runtimes:** run a tiny script and assert its expected output.
- **Web frameworks:** build a minimal route/component and verify its entry renders.
- **Markup and data formats:** parse a valid fixture and reject one malformed fixture.
- **Databases and query languages:** validate a bounded query against a disposable fixture and verify denied access stays denied.
- **Infrastructure and CI tools:** run configuration validation or a dry-run against a non-production fixture.
- **Security and quality tools:** run the smallest relevant scan against the module they protect; record scope and findings.

## Security remediation workflow

1. Record the exact finding, severity, affected file/module and root cause.
2. Confirm whether the issue is reachable in the deployed path and whether sensitive data or permissions are involved.
3. Patch the root cause with least privilege and a safe fallback.
4. Run one targeted regression check plus the affected module's build/smoke check.
5. Record what was checked and what remains unverified. Never label a static scan as a live production audit.

## Lean engineering policy

- No runtime is added solely to increase the technology count.
- No language is marked Active until a real module exists and its smoke check passes.
- CI runs one catalog integrity check and the existing focused application checks.
- Avoid duplicating test suites or repeatedly scanning unchanged modules.
