-- FurFinder public directory baseline.
-- Reconstructed from the live schema and policy state on 2026-10-30.
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text NOT NULL CHECK (category IN ('community', 'convention', 'artist', 'organization', 'industry', 'resource')),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 20 AND 500),
  region text NOT NULL CHECK (region IN ('North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa')),
  country_code character(2),
  website_url text NOT NULL CHECK (website_url ~ '^https://'),
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listings IS 'Public directory entries. Only reviewed and published listings are readable through the public API.';
COMMENT ON COLUMN public.listings.source_url IS 'Public source used by moderators to verify this directory entry.';
COMMENT ON COLUMN public.listings.status IS 'Moderation state. Public clients can only read published entries.';

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published directory listings" ON public.listings;
CREATE POLICY "Anyone can read published directory listings"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

GRANT SELECT ON TABLE public.listings TO anon, authenticated;
