# Trusted XML Importer — v1 Engineering Design

Status: implementation-ready design; runtime implementation is not included.
Related contract: existing XML v1 contract under contracts/.

## Goal and pipeline

Provide a controlled path for moderators to stage organizer-authorized public entity records from XML without treating external documents as trusted directory data.

1. Receive only moderator-initiated uploads; verify moderator authorization server-side.
2. Enforce a configurable byte limit before parsing. Do not trust client Content-Length alone.
3. Use a maintained parser with DTD processing disabled, external general/parameter entities disabled, external schema/network resolution disabled, and entity expansion constrained.
4. Allow only the documented XML v1 root, namespace and element/attribute allowlist. Reject unknown structure.
5. Normalize bounded text, HTTPS URLs, dates and time zones; preserve source timezone.
6. Detect duplicates using canonical URL and stable organizer identity. Never auto-merge.
7. Stage pending candidates with source URL, retrieval timestamp, field-level evidence, importer version and validation result.
8. Require moderator comparison against organizer-controlled sources, terms/access review and explicit publish action.
9. Audit importer version, actor, decision, timestamp and bounded reason codes. Do not retain raw XML longer than operationally necessary.
10. Emit aggregate counters and redacted errors; never log full XML or private data.

## Minimum field allowlist

- Entity type and display name.
- Canonical public homepage URL.
- Bounded public description.
- Public country/region or event locality only when explicitly published.
- Event start/end and timezone only when explicitly supported.
- Public organization contact URL only; no personal email/phone extraction by default.
- Per-field source URL and retrieval timestamp.

Exclude attendee/member data, private contacts, exact personal whereabouts, birth dates, account identifiers, payment/registration data, private chat content and copied media.

## Security requirements

- Disable DTDs and external entities; no network or local-file resolution.
- Reject DOCTYPE, external entity declarations, external schema references and unsupported namespaces.
- Apply byte, depth, element-count, attribute-count, text-length and processing-time limits.
- Parse in a bounded server-side context; never use browser-side XML parsing for privileged imports.
- Treat text as untrusted; escape output and never render imported markup as HTML.
- Use fixed selectors; no dynamic XPath from user input.
- Keep secrets and elevated Supabase credentials server-side.
- Use idempotency for repeated upload attempts and rate-limit moderator imports.

OWASP reference: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html

## Failure behavior

Return a generic validation category and safe field path; do not echo parser internals or raw fragments. A failed import creates no listing and no partial published state. Partial row staging is allowed only if the contract explicitly supports isolated per-record validation.

## Acceptance tests

- Valid v1 XML produces pending candidates only.
- Malformed, oversized, deeply nested and excessive-element documents are rejected.
- DTD, external entity, external schema and entity-expansion documents are rejected without external access.
- Unknown root, namespace or field is rejected.
- Non-HTTPS URL, invalid date/timezone and end-before-start are rejected.
- Duplicate upload is idempotent.
- Unauthorized moderator cannot import or publish.
- Candidate is absent from public APIs until explicit approval.
- Audit records omit raw XML and private data.
