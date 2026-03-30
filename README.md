# Rosterly

Next.js application with Supabase backend. TypeScript, Tailwind CSS, App Router. Scaffolding and configuration only—no features implemented yet.

## Requirements

- **Node.js**: Latest LTS (20.x or 22.x). See `engines` in `package.json`.
- **Supabase**: Project for Auth, Postgres, Storage, and RLS.

## Architecture

- **Frontend**: Next.js App Router (`/app`).
- **Backend**: Supabase only—no separate Express or Node server.
  - **Auth**: Supabase Auth (session via cookies, handled with `@supabase/ssr`).
  - **Data**: Postgres with Row Level Security (RLS).
  - **Storage**: Supabase Storage (when needed).
  - **Security**: RLS policies and server-side checks; never trust client alone.

## Roles

Access is modeled with three roles. Enforce them in RLS and in server-side code; client-side checks are for UX only.

| Role          | Purpose |
|---------------|--------|
| **participant** | Default role; end users participating in roster/event flows. |
| **merchant**    | Can manage offerings, inventory, or roster-related commerce. |
| **admin**       | Full access for support and configuration; use sparingly. |

Role values live in `lib/roles.ts`. Store the active role per user in your Supabase `profiles` (or equivalent) and use it in RLS policies and API/Server Actions.

## Safety-first design

- **RLS**: Every table that holds user or tenant data should have RLS enabled and policies that restrict rows by role and ownership.
- **Server-only secrets**: `SUPABASE_SERVICE_ROLE_KEY` must only be used in server code (e.g. Server Actions, Route Handlers, cron jobs). It bypasses RLS—never expose it to the client or use it for normal user flows.
- **Validation**: Use **Zod** (and optionally **react-hook-form**) on forms and any server inputs. Validate and authorize on the server before calling Supabase.
- **Auth**: Use `@supabase/ssr` for cookie-based sessions. Middleware refreshes the session; use `lib/auth.ts` in Server Components and Server Actions, and `lib/supabaseClient.ts` in Client Components.

## Dummy payments and transport

When you implement payments and delivery/transport:

- Treat them as **dummy/placeholder** flows until real providers are integrated (e.g. Stripe, real shipping APIs).
- Use clear feature flags or env vars (e.g. `USE_DUMMY_PAYMENTS`) so production can switch to real providers without code changes.
- Log dummy transactions for debugging; never expose real payment or shipping credentials in frontend or in dummy paths.

## Supabase usage

1. **Create a project** at [app.supabase.com](https://app.supabase.com).
2. **Environment variables**: Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/public key (safe for browser; RLS enforces security).
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-only; bypasses RLS).
3. **Client usage**:
   - **Browser (Client Components)**: `createClient()` from `lib/supabaseClient.ts`.
   - **Server (Server Components, Route Handlers, Server Actions)**: `createClient()` from `lib/auth.ts`.
4. **Auth**: Supabase Auth handles sign-up, sign-in, and sessions. Use Supabase dashboard to configure email, OAuth, etc. Middleware in `middleware.ts` refreshes the session on each request.
5. **Database**: Design tables with RLS in mind; add policies per role/table. Use migrations in the Supabase SQL editor or via CLI.
6. **Storage**: Use Supabase Storage buckets with RLS-like policies for file access when you add upload/download features.

## Project structure

```
/app          # Next.js App Router routes and layouts
/components   # React components
/lib          # Supabase clients and app logic
  supabaseClient.ts   # Browser client
  auth.ts             # Server client (session-aware)
  roles.ts            # Role constants and helpers
/types        # Shared TypeScript types
/utils        # Shared utilities (e.g. clsx)
middleware.ts # Session refresh and route handling
```

## Scripts

- `npm run dev`   — Development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint`  — Run ESLint

## Installed packages

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **@supabase/supabase-js** — Supabase client
- **@supabase/ssr** — Cookie-based auth for Next.js (replaces deprecated auth-helpers-nextjs)
- **zod** — Schema validation
- **react-hook-form** — Form state and validation wiring
- **clsx** — Class name composition
- **lucide-react** — Icons
