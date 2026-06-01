-- SOS location + gig context
ALTER TABLE public.sos_events
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lon numeric,
  ADD COLUMN IF NOT EXISTS gig_title text,
  ADD COLUMN IF NOT EXISTS gig_address text;

-- Safety check-ins during active gigs
CREATE TABLE IF NOT EXISTS public.safety_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  lat numeric,
  lon numeric,
  checked_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_checkins_user_id ON public.safety_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_booking_id ON public.safety_checkins(booking_id);

ALTER TABLE public.safety_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own safety checkins"
  ON public.safety_checkins FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins see all safety checkins"
  ON public.safety_checkins FOR SELECT
  TO authenticated
  USING ((SELECT private.get_my_role()) = 'admin');

-- Chat AI moderation + system messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS ai_verdict text,
  ADD COLUMN IF NOT EXISTS ai_category text,
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false;

ALTER TABLE public.messages
  ALTER COLUMN sender_id DROP NOT NULL;

COMMENT ON COLUMN public.messages.is_system IS 'Platform reminder; sender_id may be null.';
COMMENT ON COLUMN public.messages.ai_verdict IS 'AI moderation verdict: clean, warn, flag, block.';
COMMENT ON COLUMN public.messages.ai_category IS 'AI moderation category when flagged/warned.';
