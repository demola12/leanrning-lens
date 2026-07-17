-- Create activities table for tracking teacher dashboard feed
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'student_joined',
    'student_submitted',
    'student_resubmitted',
    'assignment_published',
    'pdf_converted'
  )),
  description text not null,
  student_id uuid references public.profiles(id) on delete set null,
  assignment_id uuid references public.assignments(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index for fast dashboard queries
create index if not exists idx_activities_teacher_id on public.activities(teacher_id);
create index if not exists idx_activities_created_at on public.activities(created_at desc);
create index if not exists idx_activities_teacher_created on public.activities(teacher_id, created_at desc);

-- Enable RLS
alter table public.activities enable row level security;

-- Teacher can read their own activities
create policy "Teachers can read own activities"
  on public.activities
  for select
  using (teacher_id = (select id from public.profiles where user_id = auth.uid()));

-- Service role can insert (from backend API routes)
