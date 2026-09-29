# NUPS-G Resource Hub

A public, student-led library for lecture slides and past questions. Built with React, Vite, Framer Motion, Tailwind CSS, Supabase (metadata) and UploadThing (file storage).

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app displays sample resources until Supabase is configured. Real file
uploads need the API route, so run `vercel dev` instead of `vite` when
testing uploads locally.

## Connect Supabase

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/public-access.sql`](supabase/public-access.sql). It creates the `resources` table, policies, and atomic download counter function.
3. Run [`supabase/uploadthing-migration.sql`](supabase/uploadthing-migration.sql). It adds the `file_url` / `file_key` columns for UploadThing files.
4. Create `.env` from the values in your project’s API settings:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart Vite. Resources will now be read from Supabase; file bytes upload to UploadThing.

## Connect UploadThing

1. Sign up at UploadThing and create an app.
2. Copy the app token from the dashboard (API Keys).
3. Add it as `UPLOADTHING_TOKEN` in `.env` (local) and in Vercel project settings (preview + production). It is server-only, never `VITE_` prefixed.
4. The FileRouter lives in [`api/uploadthing.js`](api/uploadthing.js) with a single `resourceUploader` endpoint (PDF up to 16MB, DOCX/PPTX/ZIP via blob up to 32MB, video up to 64MB). The client helper is in [`src/lib/uploadthing.js`](src/lib/uploadthing.js).

Legacy rows uploaded before this change still download from the old Supabase Storage bucket; new uploads download straight from the UploadThing CDN.

## Deploy to Vercel

Push the repository to GitHub, import it in Vercel, and add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `UPLOADTHING_TOKEN` in Vercel’s project settings. The build command is `npm run build` and the output directory is `dist`.
