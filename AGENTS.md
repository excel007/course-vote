# AGENTS.md

This project uses **Next.js 16.2.2** with the App Router.

## Key Conventions
- All pages use `'use client'` (client-side Supabase calls)
- Styles via Tailwind CSS + inline `style` props for dynamic colors
- Airbnb design system implemented via Tailwind config (see DESIGN.md for details)
- `lib/supabase.ts` — Supabase client (uses env vars)
- `lib/types.ts` — shared TypeScript types and RATINGS constant
- Admin auth via password-only login (cookie-based, HMAC-signed session token)
- Supabase schema in `supabase/schema.sql`

## Essential Commands
- **Dev server**: `npm run dev` (requires `.env.local` with Supabase credentials)
- **Build**: `npm run build` (fails without Supabase env vars at build time)
- **Lint**: `npm run lint`
- **Typecheck**: Included in build process via Vercel's automatic TypeScript checking

## Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Fill in Supabase URL and anon key from Supabase project settings
3. Set `ADMIN_PASSWORD` for /admin access
3. **Critical**: These env vars are required at **build time** for Vercel deployment
4. Local dev also requires these for Supabase client initialization

## Database Setup
Run `supabase/schema.sql` in Supabase SQL Editor to create tables and policies
- Tables: `courses` (id, name, code, allowed_years), `votes` (id, course_id, rating, year)
- RLS policies allow public read/insert

## Pages Structure
- `/` — Voting page (select year, vote on courses)
- `/dashboard` — Vote summary with year filtering
- `/admin` — Admin CRUD for courses + year restrictions (password-protected)

## Deployment Gotchas
- Vercel build fails if Supabase env vars missing (error: "supabaseKey is required")
- Ensure env vars are set in Vercel project settings under Environment Variables
- Uses Turbopack for faster builds