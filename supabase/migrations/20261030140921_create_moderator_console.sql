-- FurFinder moderator console: server-only moderator registry and atomic review log.
CREATE TABLE public.moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'reviewer'
    CHECK (role IN ('admin', 'reviewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.moderators IS
  'Server-side moderator allowlist. No browser role has table privileges.';

ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.moderators FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.moderators TO service_role;

CREATE TABLE public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  moderator_user_id uuid NOT NULL REFERENCES public.moderators(user_id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('published', 'rejected')),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.moderation_events IS
  'Append-only record of moderator decisions made by the trusted server API.';

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.moderation_events FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.moderation_events TO service_role;

CREATE OR REPLACE FUNCTION public.review_listing(
  p_listing_id uuid,
  p_moderator_id uuid,
  p_decision text,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_status text;
  v_note text;
BEGIN
  IF p_decision IS DISTINCT FROM 'publish'
     AND p_decision IS DISTINCT FROM 'reject' THEN
    RAISE EXCEPTION 'Invalid moderation decision'
      USING ERRCODE = '22023';
  END IF;

  v_note := NULLIF(pg_catalog.btrim(p_note), '');
  IF v_note IS NOT NULL AND pg_catalog.char_length(v_note) > 500 THEN
    RAISE EXCEPTION 'Moderation note is too long'
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.moderators AS m
    WHERE m.user_id = p_moderator_id
      AND m.active = true
      AND m.role IN ('admin', 'reviewer')
  ) THEN
    RAISE EXCEPTION 'Moderator access is not active'
      USING ERRCODE = '42501';
  END IF;

  v_status := CASE p_decision
    WHEN 'publish' THEN 'published'
    ELSE 'rejected'
  END;

  UPDATE public.listings AS l
  SET status = v_status,
      verified_at = CASE
        WHEN p_decision = 'publish' THEN pg_catalog.now()
        ELSE NULL
      END,
      updated_at = pg_catalog.now()
  WHERE l.id = p_listing_id
    AND l.status = 'pending'
  RETURNING l.* INTO v_listing;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing is missing or is no longer pending'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.moderation_events (
    listing_id,
    moderator_user_id,
    decision,
    note
  ) VALUES (
    v_listing.id,
    p_moderator_id,
    v_status,
    v_note
  );

  RETURN pg_catalog.jsonb_build_object(
    'id', v_listing.id,
    'name', v_listing.name,
    'status', v_listing.status,
    'verified_at', v_listing.verified_at,
    'updated_at', v_listing.updated_at
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.review_listing(uuid, uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_listing(uuid, uuid, text, text)
  TO service_role;
