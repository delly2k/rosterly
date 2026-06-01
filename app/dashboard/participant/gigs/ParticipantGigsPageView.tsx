"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileGigFeed from "@/components/mobile/participant/MobileGigFeed";
import { ParticipantGigsPageClient } from "./ParticipantGigsPageClient";
import type { GigBrowseItem } from "./ParticipantGigCard";

export function ParticipantGigsPageView({ gigs }: { gigs: GigBrowseItem[] }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (isMobile) return <MobileGigFeed gigs={gigs} />;
  return <ParticipantGigsPageClient gigs={gigs} />;
}
