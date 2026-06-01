-- Gig invitations from merchants to participants
CREATE TABLE public.gig_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  merchant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  match_score integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gig_id, participant_user_id)
);

CREATE INDEX idx_gig_invitations_participant ON public.gig_invitations(participant_user_id);
CREATE INDEX idx_gig_invitations_gig ON public.gig_invitations(gig_id);
CREATE INDEX idx_gig_invitations_merchant ON public.gig_invitations(merchant_user_id);

ALTER TABLE public.gig_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see own invitations"
  ON public.gig_invitations FOR SELECT
  TO authenticated
  USING (participant_user_id = auth.uid());

CREATE POLICY "Merchants see own invitations"
  ON public.gig_invitations FOR SELECT
  TO authenticated
  USING (merchant_user_id = auth.uid());

CREATE POLICY "Merchants can invite to own gigs"
  ON public.gig_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gigs
      WHERE id = gig_id AND merchant_user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can respond to invitations"
  ON public.gig_invitations FOR UPDATE
  TO authenticated
  USING (participant_user_id = auth.uid())
  WITH CHECK (participant_user_id = auth.uid());

CREATE POLICY "Admins see all invitations"
  ON public.gig_invitations FOR SELECT
  TO authenticated
  USING ((SELECT private.get_my_role()) = 'admin');

-- Participants can read merchant business name when invited
CREATE POLICY "Participants can view merchant profile for invitations"
  ON public.merchant_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gig_invitations gi
      WHERE gi.participant_user_id = auth.uid()
        AND gi.merchant_user_id = merchant_profiles.user_id
    )
  );

-- Merchants can browse verified participants for AI matching
CREATE POLICY "Merchants can view verified participants for matching"
  ON public.participant_profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT private.get_my_role()) = 'merchant'
    AND verified = true
  );
