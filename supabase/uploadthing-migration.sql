-- NUPS-G Resource Hub: UploadThing migration.
-- Run once in the Supabase SQL editor AFTER supabase/public-access.sql.
-- New uploads store file bytes in UploadThing and keep only metadata here.

alter table public.resources
	add column if not exists file_url text,
	add column if not exists file_key text;

-- file_path stays NOT NULL for backwards compat; new rows store the
-- UploadThing file key there. Older rows keep their Storage path.
-- Optional: once all rows are migrated you can backfill with:
-- update public.resources set file_url = file_path where file_url is null and file_path like 'http%';
