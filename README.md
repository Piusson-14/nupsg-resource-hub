# NUPS-G Resource Hub

A public, student-led library for lecture slides and past questions. Built with React, Vite, Framer Motion, Tailwind CSS and Supabase.

## Local setup

```bash
npm install
npm run dev
```

The app displays sample resources until Supabase is configured.

## Connect Supabase

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/public-access.sql`](supabase/public-access.sql). It creates the `resources` table, public `nupsg-resources` bucket, policies, and atomic download counter function.
3. Create `.env` from the values in your project’s API settings:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Restart Vite. Resources will now be read from and uploaded to Supabase Storage.

## Deploy to Vercel

Push the repository to GitHub, import it in Vercel, and add the two `VITE_` environment variables in Vercel’s project settings. The build command is `npm run build` and the output directory is `dist`.
