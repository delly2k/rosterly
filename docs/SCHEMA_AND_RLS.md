# Schema and RLS Summary

## Overview

- **Migration**: `supabase/migrations/20250205120000_initial_schema_and_rls.sql`
- Apply via Supabase Dashboard (SQL Editor) or `supabase db push` if using local Supabase CLI.

## Tables

| Table | Purpose |
|------|--------|
| `profiles` | One per user (`id` = `auth.users.id`). `role` (participant \| merchant \| admin), `status` (pending \| active \| suspended \| banned). |
| `participant_profiles` | Extended participant data (full_name, photo_url, bio, skills, availability, rate, emergency_contact, verified). |
| `merchant_profiles` | Extended merchant data (business_name, business_type, officer_name, verified). |
| `verifications` | ID/selfie uploads and review (type, id_doc_url, selfie_url, status, reviewed_by, reviewed_at). |
| `gigs` | Merchant-created gigs (title, duties, pay_rate, location_general, start/end_time, status). **No exact address here.** |
| `gig_locations` | **Exact location only.** One row per gig. Restricted so participants see it only when booked. |
| `applications` | Participant applies to a gig (one row per gig + participant). |
| `bookings` | Confirmed assignment (participant + gig); status (pending, confirmed, etc.). |
| `checkins` | In/out check-in with lat/lon for a booking. |
| `chats` | One chat per (gig, participant) with merchant and participant. |
| `messages` | Messages in a chat (sender_id, body, flagged). |
| `reports` | User-submitted reports (reporter_id, reported_id, gig_id, category, description, status). |
| `admin_actions` | Audit log of admin actions (admin_id, action, target_table, target_id, reason). |

## Safety Decisions

### 1. **Exact gig location (participants cannot see until booked)**

- **Decision**: Exact address is in `gig_locations`, not in `gigs`.
- **Reason**: RLS is row-level, not column-level. We cannot hide a single column from a row. By putting exact location in a separate table we can:
  - Let merchants do full CRUD on `gig_locations` for their gigs.
  - Let participants **SELECT** from `gig_locations` only when they have a **confirmed/completed booking** for that gig.
- **App usage**: When listing gigs for discovery, query `gigs` (and optionally join `gig_locations` only for the current user’s booked gigs). After a booking is confirmed, the participant can fetch `gig_locations` for that gig.

### 2. **Admin checks in RLS**

- **Decision**: Helper `private.get_my_role()` (security definer) reads `profiles.role` and returns the current user’s role.
- **Reason**: RLS policies cannot join to `profiles` without either a subquery per row or a function. A **security definer** function in the `private` schema runs with owner privileges and can read `profiles` without being blocked by RLS, so we get a single cached role per request.
- **Safety**: `private` schema is not exposed via the Supabase API, so the helper is only used inside the database.

### 3. **Profiles and signup**

- **Decision**: Trigger `on_auth_user_created` inserts a row into `profiles` on `auth.users` insert (id, role default `participant`, status default `pending`).
- **Reason**: Every user gets a profile without requiring the app to remember to create it. Role/status changes can be done later by app logic or admin.

### 4. **Who can read what**

- **Own profile data**: Users can only read/update their own `profiles`, `participant_profiles`, and `merchant_profiles`. Admins can read all profiles and role-specific profile tables.
- **Gigs**: Merchants full CRUD on their gigs. Authenticated users can **read** gigs with status ≠ draft (discovery). Admins can read all.
- **Applications**: Participants see and manage their own; merchants see and update applications for their gigs; admins read all.
- **Bookings**: Participants see own; merchants see and manage bookings for their gigs; admins read all.
- **Messages**: Only chat participants (merchant or participant for that chat) and admins can read messages. Only chat participants can insert (as themselves).
- **Reports**: Reporters can create and read their own reports; admins can read all and update status.
- **Admin actions**: Only admins can insert and read (audit trail).

### 5. **Performance**

- Policies use `(select auth.uid())` and `(select private.get_my_role())` so Postgres can cache the result per statement.
- Indexes are added on foreign keys and common filters (e.g. `gig_id`, `participant_user_id`, `status`) to keep RLS checks efficient.

## Applying the migration

1. Open your Supabase project → SQL Editor.
2. Paste the contents of `supabase/migrations/20250205120000_initial_schema_and_rls.sql`.
3. Run the script.

Or with Supabase CLI (from project root):

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Optional: hide draft gigs from discovery

The current policy allows any authenticated user to **select** gigs where `status <> 'draft'`. If you prefer to expose only `open` (or a subset of statuses), change the policy to something like:

```sql
using ( status = 'open' );  -- or: status in ('open', 'filled', 'completed')
```

You can add this as a separate migration or edit the initial migration before first apply.
