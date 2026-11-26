# Spindle
React + Vite collector community hosted at https://spindle-seven.vercel.app.

Use Node 24, npm ci, and npm run dev for the frontend. Use Vercel development mode to run the Discogs server function locally. npm run build emits dist.

## Configuration
Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at build time. Set DISCOGS_TOKEN only as a server-side environment variable. Without Supabase settings the frontend runs the original demo.

For a fresh Supabase project apply supabase/schema.sql, buddies.sql, trade_matches.sql and community.sql in that order. The live project already has these migrations. Set Authentication → URL Configuration → Site URL to the production origin. Enable email/password sign-in. For Google login configure the Google provider credentials and enable it; the sign-in screen reads the provider settings.

## Member features
Profiles include a screen name, joined date, HTTPS avatar URL and Now Spinning status. Buddy activity reflects a visible site tab within the past two minutes. Public visitors can read forum threads and replies. Members can post to crates, start blind rating threads, import Discogs releases, scan barcodes, manage a shelf and wantlist, and match exact releases for trade with accepted buddies. The listening party and visual player in the original interface are prototype features.

## Deployment
The production site is https://spindle-seven.vercel.app. The Vercel project is spindle, with the Vite preset. Production source is on the main branch of justjckvv/spindle.
