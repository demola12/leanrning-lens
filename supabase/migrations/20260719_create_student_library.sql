create table if not exists public.student_library (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf', 'other')),
  file_name text not null,
  description text default '',
  viewed boolean not null default false,
  viewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_library_student on public.student_library(student_profile_id);
create index if not exists idx_student_library_teacher on public.student_library(teacher_id);
create index if not exists idx_student_library_created on public.student_library(created_at desc);

alter table public.student_library enable row level security;

create policy "Students can insert own library items"
  on public.student_library
  for insert
  with check (
    student_profile_id = (select id from public.profiles where user_id = auth.uid())
    or student_profile_id in (select id from public.profiles where parent_profile_id = (select id from public.profiles where user_id = auth.uid()))
  );

create policy "Students can view own library items"
  on public.student_library
  for select
  using (
    student_profile_id = (select id from public.profiles where user_id = auth.uid())
    or student_profile_id in (select id from public.profiles where parent_profile_id = (select id from public.profiles where user_id = auth.uid()))
  );

create policy "Teachers can view library items of their students"
  on public.student_library
  for select
  using (
    teacher_id = (select id from public.profiles where user_id = auth.uid())
  );

create policy "Teachers can update viewed status"
  on public.student_library
  for update
  using (
    teacher_id = (select id from public.profiles where user_id = auth.uid())
  );
