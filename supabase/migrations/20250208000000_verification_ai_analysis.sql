ALTER TABLE public.verifications
  ADD COLUMN IF NOT EXISTS ai_verdict text
    CHECK (ai_verdict IN ('pass', 'review', 'flag')),
  ADD COLUMN IF NOT EXISTS ai_confidence integer,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at timestamptz;
