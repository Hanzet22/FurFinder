-- Guarantee that concurrent first-admin bootstrap requests cannot create two active admins.
-- Existing moderator count was checked before applying this migration.
CREATE UNIQUE INDEX moderators_single_active_admin_idx
  ON public.moderators ((role))
  WHERE role = 'admin' AND active = true;
