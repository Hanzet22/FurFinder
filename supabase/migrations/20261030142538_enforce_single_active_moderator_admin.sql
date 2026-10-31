-- Keep the moderator allowlist to a single active admin account.
-- This mirrors the migration already recorded in the linked Supabase project.
CREATE UNIQUE INDEX IF NOT EXISTS moderators_single_active_admin_idx
  ON public.moderators (role)
  WHERE role = 'admin' AND active = true;
