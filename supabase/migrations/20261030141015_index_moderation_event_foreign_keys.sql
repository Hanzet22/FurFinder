CREATE INDEX moderation_events_listing_created_idx
  ON public.moderation_events (listing_id, created_at DESC);

CREATE INDEX moderation_events_moderator_created_idx
  ON public.moderation_events (moderator_user_id, created_at DESC);
