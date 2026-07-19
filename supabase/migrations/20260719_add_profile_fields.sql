alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists display_name text,
  add column if not exists phone text,
  add column if not exists date_of_birth date,
  add column if not exists country text,
  add column if not exists timezone text,
  add column if not exists bio text,
  add column if not exists subjects text[],
  add column if not exists school text,
  add column if not exists teaching_experience text;
