# Public API v1 contract

The public API contract is maintained in OpenAPI 3.1 and JSON Schema 2020-12:

- `contracts/openapi.yaml` describes `GET /api/v1/listings`.
- `contracts/schemas/listings-response.schema.json` defines the success envelope and public listing fields.
- `contracts/fixtures/listings-response.example.json` is a safe, synthetic example.
- `scripts/validate-api-contracts.mjs` checks the fixture against the documented schema constraints.
- `api/lib/validate-listings-response.ts` enforces the public-field allowlist and data constraints on every upstream response before it is returned.
- `src/lib/directory.ts` and the Flutter repository both consume the same same-origin API route; neither client queries Supabase directly for directory records.
- `tests/runtime-api-contract.test.mjs` covers the validator and exercises the Vercel route with a mocked upstream response.

Run `npm run validate:contracts` for the fixture check and `npm test` for the API tests. The production build runs the fixture validation and test suite automatically.

## Runtime

The Vercel route exports a named `GET(request)` handler using the Web Request/Response API. It uses only the Supabase publishable key, requests a fixed field projection, filters to `status=published`, caps results at 60, and applies a short shared-cache policy. It does not use a service-role or secret key.

## Security boundary

The endpoint exposes published records only. The web and Flutter clients share this versioned endpoint, keeping filtering, caching, and response shape consistent. It does not expose pending/rejected entries, moderator data, personal contact details, private meetup details, or precise personal locations. The runtime validator rejects unexpected envelope or listing properties, invalid identifiers/enums/dates, non-HTTPS URLs, and records outside the database field constraints.

The fixture checker is intentionally dependency-free and is not a complete implementation of every JSON Schema keyword. Runtime enforcement is implemented separately in the API route; use a standards-compliant JSON Schema validator if full schema-keyword evaluation is required in the future.
