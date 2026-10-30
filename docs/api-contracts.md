# Public API v1 contract

The public API contract is maintained in OpenAPI 3.1 and JSON Schema 2020-12:

- `contracts/openapi.yaml` describes `GET /api/v1/listings`.
- `contracts/schemas/listings-response.schema.json` defines the success envelope and public listing fields.
- `contracts/fixtures/listings-response.example.json` is a safe, synthetic example.
- `scripts/validate-api-contracts.mjs` checks the fixture against the schema's required fields, supported enums, HTTPS URL constraints, timestamp shape, and field allowlist.

Run `npm run validate:contracts`. The production build runs this validation automatically.

## Security boundary

The endpoint exposes published records only, with a fixed public-field projection and a 60-record cap. It does not expose pending/rejected entries, moderator data, personal contact details, private meetup details, or precise personal locations. The schema intentionally rejects additional listing properties so accidental API expansion requires an explicit contract change.

This validator is intentionally dependency-free and focused on the checked-in fixture; it is not a complete implementation of every JSON Schema keyword. Use a standards-compliant validator if runtime payload validation is later required.
