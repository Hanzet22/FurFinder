-- PROPOSAL ONLY: do not apply to production without review and explicit release approval.
-- Target: Supabase project FurFinder. This file is intentionally outside supabase/migrations/.
-- Public entity provenance + event dates + separate adult opt-in public profiles.

create table if not exists public.directory_sources (
  id uuid primary key default gen_random_uuid(),
  source_url text not null check (source_url ~ '^https://'),
  canonical_url text not null check (canonical_url ~ '^https://'),
  source_kind text not null check (source_kind in ('official_organizer','official_organization','public_community','public_portfolio','aggregator','public_resource')),
  publisher_name text,
  terms_review_state text not null default 'pending' check (terms_review_state in ('pending','allowed','restricted','disallowed')),
  robots_review_state text not null default 'pending' check (robots_review_state in ('pending','allowed','restricted','disallowed')),
  access_reviewed_at timestamptz,
  retrieved_at timestamptz,
  last_checked_at timestamptz,
  review_notes text check (review_notes is null or char_length(review_notes) <= 1000),
  created_at timestamptz not null default now(),
  unique (canonical_url)
);
comment on table public.directory_sources is 'Server-managed source registry. Never expose crawl notes or source eligibility review to public clients.';

create table if not exists public.listing_sources (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  source_id uuid not null references public.directory_sources(id) on delete restrict,
  evidence_fields text[] not null default '{}',
  evidence_note text check (evidence_note is null or char_length(evidence_note) <= 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (listing_id, source_id)
);
comment on table public.listing_sources is 'Field-level provenance references for public entity listings; no copied page dumps.';

create table if not exists public.directory_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  venue_name text check (venue_name is null or char_length(venue_name) <= 180),
  venue_locality text check (venue_locality is null or char_length(venue_locality) <= 120),
  event_status text not null default 'unconfirmed' check (event_status in ('unconfirmed','announced','postponed','cancelled','completed')),
  date_confirmation_source_id uuid references public.directory_sources(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or ends_at >= starts_at)
);
comment on table public.directory_events is 'Event-only metadata; never store attendee lists or participant whereabouts.';

-- Public projection deliberately excludes account IDs, DOB, email, consent evidence and moderation notes.
create table if not exists public.public_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  public_handle text not null check (char_length(public_handle) between 2 and 40),
  bio text check (bio is null or char_length(bio) <= 500),
  country_code character(2),
  public_links jsonb not null default '[]'::jsonb check (jsonb_typeof(public_links) = 'array' and jsonb_array_length(public_links) <= 5),
  eligibility_verified_at timestamptz,
  consent_version text,
  consented_at timestamptz,
  published_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id),
  check (published_at is null or (eligibility_verified_at is not null and consented_at is not null and consent_version is not null and withdrawn_at is null))
);
comment on table public.public_profiles is 'Adults-only, opt-in public profile projection. eligibility_verified_at is set only by a trusted server-side eligibility workflow; never accept it from a client.';

-- Consent evidence stays in a non-exposed schema and is not readable through the Data API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.profile_consent_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.public_profiles(id) on delete cascade,
  account_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('consented','published','unpublished','withdrawn','deleted')),
  consent_version text,
  created_at timestamptz not null default now()
);
revoke all on private.profile_consent_events from public, anon, authenticated;

alter table public.directory_sources enable row level security;
alter table public.listing_sources enable row level security;
alter table public.directory_events enable row level security;
alter table public.public_profiles enable row level security;

-- Browser roles cannot create or modify source/provenance records.
revoke all on public.directory_sources, public.listing_sources from public, anon, authenticated;
revoke all on public.directory_events from public, anon, authenticated;
revoke all on public.public_profiles from public, anon, authenticated;

-- Public event metadata is readable only when its parent listing is published.
grant select on public.directory_events to anon, authenticated;
drop policy if exists "Read event metadata for published listings" on public.directory_events;
create policy "Read event metadata for published listings"
  on public.directory_events for select to anon, authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.status = 'published'));

-- Public profile reads require both explicit publication and a server-verified adult eligibility marker.
-- Column-level grants prevent account_id and internal consent/eligibility fields from leaking.
grant select (id, public_handle, bio, country_code, public_links, published_at)
  on public.public_profiles to anon, authenticated;
drop policy if exists "Read published adult opt-in profiles" on public.public_profiles;
create policy "Read published adult opt-in profiles"
  on public.public_profiles for select to anon, authenticated
  using (published_at is not null and withdrawn_at is null and eligibility_verified_at is not null and consented_at is not null);

-- No browser INSERT/UPDATE/DELETE grants are issued for profile data. All writes must pass
-- through a trusted server endpoint that validates ownership, consent and eligibility.
