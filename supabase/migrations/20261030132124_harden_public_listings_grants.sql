-- Public directory clients only need read access.
-- RLS continues to restrict SELECT to published rows.
REVOKE ALL PRIVILEGES ON TABLE public.listings FROM anon, authenticated;
GRANT SELECT ON TABLE public.listings TO anon, authenticated;
