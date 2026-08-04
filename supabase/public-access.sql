-- NUPS-G Resource Hub: run once in the Supabase SQL editor.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  university text not null,
  department text not null,
  course_code text not null,
  course_name text not null,
  level text not null check (level in ('100','200','300','400')),
  semester text not null check (semester in ('First Semester','Second Semester')),
  category text not null check (category in ('slides','past_questions')),
  file_name text not null,
  file_path text not null,
  file_size bigint not null default 0,
  downloads integer not null default 0,
  created_at timestamptz not null default now()
);

-- Adds the column if upgrading the supplied starter table.
alter table public.resources add column if not exists course_name text;
update public.resources set course_name = course_code where course_name is null;
alter table public.resources alter column course_name set not null;

alter table public.resources enable row level security;
create policy "Anyone can browse resources" on public.resources for select using (true);
create policy "Anyone can share resources" on public.resources for insert with check (true);

-- Counter updates are kept in one atomic database operation.
create or replace function public.increment_resource_downloads(resource_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.resources set downloads = downloads + 1 where id = resource_id;
$$;
grant execute on function public.increment_resource_downloads(uuid) to anon;

insert into storage.buckets (id, name, public) values ('nupsg-resources','nupsg-resources',true)
on conflict (id) do update set public = true;
create policy "Anyone can read resource files" on storage.objects for select using (bucket_id = 'nupsg-resources');
create policy "Anyone can upload resource files" on storage.objects for insert with check (bucket_id = 'nupsg-resources');
