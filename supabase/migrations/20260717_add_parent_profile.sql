-- Add parent_profile_id to support multiple children under one auth user
alter table public.profiles
  add column if not exists parent_profile_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_profiles_parent on public.profiles(parent_profile_id);

-- Create a view for parent to see their children profiles
-- (used by the profile switcher and dashboard)
