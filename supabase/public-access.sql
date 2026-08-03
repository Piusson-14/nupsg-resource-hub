-- Run this in the Supabase SQL editor.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  university text not null,
  department text not null,
  course_code text not null,
  level text not null,
  semester text not null,
  category text not null,
  file_name text not null,
  file_path text not null,
  file_size bigint default 0,
  downloads integer default 0,
  created_at timestamptz default now()
);

alter table public.resources enable row level security;

create policy if not exists "public read resources"
  on public.resources
  for select
  using (true);

create policy if not exists "public insert resources"
  on public.resources
  for insert
  with check (true);

create policy if not exists "public update resources"
  on public.resources
  for update
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('nupsg-resources', 'nupsg-resources', true)
on conflict (id) do update set public = true;

create policy if not exists "public read objects"
  on storage.objects
  for select
  using (bucket_id = 'nupsg-resources');

create policy if not exists "public insert objects"
  on storage.objects
  for insert
  with check (bucket_id = 'nupsg-resources');

create policy if not exists "public update objects"
  on storage.objects
  for update
  using (bucket_id = 'nupsg-resources')
  with check (bucket_id = 'nupsg-resources');

create policy if not exists "public delete objects"
  on storage.objects
  for delete
  using (bucket_id = 'nupsg-resources');
