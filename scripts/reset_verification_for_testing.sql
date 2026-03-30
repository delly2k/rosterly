-- Reset a participant's verification state so you can test the flow again.
-- Run this in the Supabase SQL Editor (or psql) after replacing the placeholder.
--
-- Replace YOUR_USER_ID with the participant's user_id (e.g. from auth.users or profiles).
-- Example: 1e594d7f-083d-448d-8591-1bd7da370d21

-- 1) Set participant_profiles.verified = false
UPDATE public.participant_profiles
SET verified = false, updated_at = now()
WHERE user_id = 'YOUR_USER_ID';

-- 2) Set the latest participant_id verification to 'rejected' (so they appear unverified and can resubmit)
UPDATE public.verifications
SET status = 'rejected', reviewed_by = null, reviewed_at = null
WHERE user_id = 'YOUR_USER_ID'
  AND type = 'participant_id';

-- Optional: delete the verification row(s) instead so they start completely fresh
-- DELETE FROM public.verifications
-- WHERE user_id = 'YOUR_USER_ID' AND type = 'participant_id';

-- After running: the participant will see "Unverified", can complete profile (name) if needed,
-- then submit verification again.
