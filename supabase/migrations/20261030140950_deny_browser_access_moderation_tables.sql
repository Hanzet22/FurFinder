-- Make the intended browser denial explicit for the moderator-only tables.
CREATE POLICY "No browser access to moderators"
  ON public.moderators
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No browser access to moderation events"
  ON public.moderation_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
