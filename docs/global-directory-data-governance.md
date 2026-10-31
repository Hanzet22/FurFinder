# FurFinder Global Directory — Data Governance & Expansion Plan

**Status:** Draft architecture / implementation gate  
**Scope:** Global public directory (A) + consent-based individual profiles (B)  
**Applies to:** Web, future mobile clients, ingestion jobs, moderation and exports

## 1. Product scope

FurFinder combines two clearly separated data domains:

### A. Public entity directory
- Organizations and associations
- Public furry communities and groups
- Conventions, public meets and announced events
- Studios, manufacturers, makers and businesses
- Public artists/creator portfolios and professional service pages
- Public knowledge, safety and community resources

A listing must describe an entity, service, event or public resource—not a private person’s identity or whereabouts.

### B. Voluntary individual profiles
Individual profiles are a separate, opt-in product. A profile is created only after the person signs up, sees the exact fields and visibility, and explicitly publishes it. No profile may be inferred from scraped social posts, convention attendee lists, chat groups, member directories or public usernames.

**Age-safety gate:** public individual profiles are restricted to adults (18+). Do not create public profiles for minors. Do not collect precise birth dates or identity documents for this directory. Minors may browse age-appropriate public listings; their private account data must never be repurposed into a public profile.

## 2. Non-negotiable collection rules

1. Collect only information needed to describe a public entity or a voluntarily published adult profile.
2. Use official websites and other clearly public sources. Check terms of service, robots directives, access restrictions and applicable law before crawling.
3. Respect rate limits, crawl delays, attribution requirements, copyright notices and takedown requests.
4. Never bypass login walls, paywalls, CAPTCHAs, access controls or anti-bot restrictions.
5. Do not collect private contact details, home addresses, precise personal locations, attendee/participant rosters, private chat content, sensitive traits, or inferred identity links.
6. Do not use scraped personal social profiles as a substitute for opt-in consent.
7. Discovery is not verification: every candidate record enters a review queue before public publication.
8. Keep provenance for every imported field and record when it was fetched and last checked.
9. Provide correction, report, opt-out and deletion channels.
10. Do not sell profile data, expose bulk profile exports, or use profiles for unsolicited outreach.

## 3. Data separation

Keep public entities and voluntary profiles logically separate.

### Public entity record
Suggested fields:
- `id`, `slug`, `entity_type`
- `display_name`, `summary`
- `country_code`, `region_code` (coarse geography only)
- `official_website_url`, `public_contact_page_url` (optional)
- `status` (`candidate`, `pending_review`, `published`, `rejected`, `archived`)
- `verification_state` (`unverified`, `source_checked`, `officially_confirmed`)
- `created_at`, `updated_at`, `last_verified_at`

### Source/provenance record
Suggested fields:
- `id`, `entity_id`
- `source_url`, `canonical_url`, `source_kind`
- `publisher_name`, `retrieved_at`
- `terms_review_state`, `robots_review_state`
- `field_evidence` (field names and supporting source references, not copied page dumps)
- `reviewer_id`, `reviewed_at`

### Adult opt-in profile
Suggested fields:
- `id`, `account_id` (private FK; never expose)
- `public_handle`, `short_bio`, `country_code` (optional and coarse)
- `public_links` (user supplied, validated HTTPS URLs)
- `visibility`, `consent_version`, `consented_at`
- `published_at`, `withdrawn_at`, `deleted_at`

Keep authentication identifiers, email addresses, consent evidence and moderation notes private. Public API responses must use an explicit allowlist of profile fields. A profile must be unpublished immediately when consent is withdrawn; deletion should cascade or be handled by a documented retention process.

## 4. Ingestion pipeline

1. **Discover:** Firecrawl search/map finds candidate public pages. Discovery stores URLs and short evidence only.
2. **Eligibility review:** check robots, terms, access restrictions, page ownership and whether the content is about a public entity.
3. **Extract:** scrape only necessary fields from eligible pages; do not collect page-wide personal data.
4. **Normalize:** canonicalize URLs, country codes, dates, names and entity types.
5. **Deduplicate:** use canonical URL and conservative name/location matching; ambiguous matches go to human review.
6. **Provenance:** attach source URL, retrieval timestamp and field-level evidence.
7. **Moderate:** candidate records remain unpublished until a reviewer checks accuracy, relevance, safety and source eligibility.
8. **Publish:** publish only approved fields; retain a reversible audit trail.
9. **Refresh:** recheck on a bounded schedule; mark stale records instead of silently inventing updates.
10. **Removal:** process correction, source-owner objection, opt-out and deletion requests with a traceable audit event.

No broad unattended crawl or automatic publication is authorized by this plan.

## 5. Supabase security requirements

- Enable RLS on every new table.
- Public/anon access is read-only and limited to published, explicitly allowlisted columns/views.
- No public access to consent records, account IDs, emails, source-review notes, moderation events or ingestion job internals.
- Writes go through trusted server routes or narrowly scoped Edge Functions.
- Never ship service-role/secret keys in browser or mobile bundles.
- Use separate policies for public entities and adult opt-in profiles.
- Add tests for anonymous reads, authenticated owner access, cross-account isolation, consent withdrawal and deletion.
- Do not add production tables or policies until migration review, tests and rollback plan are complete.

## 6. API and mobile requirements

- Introduce a versioned public API before the Flutter client depends on the expanded schema.
- Use cursor pagination with stable ordering; avoid offset drift for a growing global dataset.
- Filter by entity type, region and country; return provenance summary and last-verified date.
- Keep public profile routes separate from entity routes.
- Mobile clients receive only publishable data and public keys.
- Do not implement direct messaging, precise location, attendee discovery or unrestricted user search.
- Include accessible report/correction controls, clear loading/offline/error states and localization-ready labels.

## 7. UX and trust signals

Every public listing should show:
- Entity type and coarse region
- Official website or public source link
- Verification label with a plain-language explanation
- Last checked date
- Report/correction link

Avoid implying that a listing is endorsed by FurFinder merely because it appears in search. Use distinct labels for community-submitted, source-checked and officially confirmed records.

Adult profile onboarding must show a preview of exactly what becomes public, require an explicit publish action, allow unpublishing and deletion, and avoid default-public settings.

## 8. Source strategy

Start with source registries, not indiscriminate crawling:
- Official convention websites and organizer-published calendars
- Official organization and association websites
- Public community homepages and public join-information pages
- Studio/business websites and public portfolio pages
- Public knowledge and safety resources

Third-party calendars and aggregators are discovery aids only. Verify event name, date, venue and organizer against the event’s official page before publication. Store the aggregator as a discovery source, not as proof of organizer endorsement.

## 9. Rollout gates

### Gate 1 — design and source policy
- Approve entity taxonomy, source policy, adult-only profile boundary and retention/deletion workflow.
- Document jurisdiction-specific privacy review before public launch.

### Gate 2 — schema and API
- Add reviewed migrations on a feature branch.
- Test RLS and API response allowlists.
- Add cursor pagination, filters, report/correction and profile consent endpoints.

### Gate 3 — ingestion and moderation
- Begin with a small, manually reviewed source allowlist.
- Add idempotency, crawl budgets, retries, deduplication and audit logs.
- Keep all imports unpublished pending review.

### Gate 4 — UX and mobile
- Ship responsive directory and adult opt-in profile management only after backend controls pass.
- Keep mobile read-only until a safe, versioned submission workflow exists.
- Complete accessibility, privacy and minor-safety reviews.

### Gate 5 — release
- Validate GitHub CI and a fresh Vercel preview.
- Review Supabase Security Advisor and RLS tests.
- No production migration, deployment promotion or mass ingestion without a separate explicit release approval.

## 10. Current implementation baseline

The current MVP has a single `public.listings` table with categories for community, convention, artist, organization, industry and resource, plus moderator and moderation-event tables. All three public tables currently have RLS enabled. The existing schema is a useful starting point but is not sufficient for provenance-rich ingestion, event date modeling, source eligibility tracking or consent-based profiles.

The current Vite/React web client and Supabase project remain the baseline. This document is a design and governance specification only; it does not authorize production database changes, bulk crawling, profile collection, deployment or publication.
