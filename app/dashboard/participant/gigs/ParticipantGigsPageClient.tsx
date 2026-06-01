"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ParticipantGigCard } from "./ParticipantGigCard";
import { Briefcase } from "lucide-react";
import type { GigBrowseItem } from "./ParticipantGigCard";

export function ParticipantGigsPageClient({ gigs }: { gigs: GigBrowseItem[] }) {
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [matchReasons, setMatchReasons] = useState<Record<string, string[]>>({});
  const [matching, setMatching] = useState(false);
  const [matched, setMatched] = useState(false);

  async function runMatching() {
    setMatching(true);
    try {
      const res = await fetch("/api/matching/participant");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Matching failed");
      const scores: Record<string, number> = {};
      const reasons: Record<string, string[]> = {};
      (data.scores ?? []).forEach(
        (s: { gigId: string; score: number; reasons: string[] }) => {
          scores[s.gigId] = s.score;
          reasons[s.gigId] = s.reasons ?? [];
        }
      );
      setMatchScores(scores);
      setMatchReasons(reasons);
      setMatched(true);
    } catch {
      // keep UI stable on failure
    } finally {
      setMatching(false);
    }
  }

  const sortedGigs = matched
    ? [...gigs].sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0))
    : gigs;

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={Briefcase}
        title="Find gigs"
        description="Browse open gigs matched to your profile"
        action={
          <button
            type="button"
            onClick={() => void runMatching()}
            disabled={matching}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 8,
              background: matched ? "var(--color-green)" : "var(--color-gold)",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: matching ? "not-allowed" : "pointer",
              opacity: matching ? 0.8 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <Sparkles size={14} />
            {matching ? "Matching..." : matched ? "Matched ✓" : "AI match me"}
          </button>
        }
      />

      {gigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No gigs available right now"
          description="New gigs are posted regularly — check back soon"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedGigs.map((gig) => (
            <ParticipantGigCard
              key={gig.id}
              gig={gig}
              matched={matched}
              matchScore={matchScores[gig.id]}
              matchReasons={matchReasons[gig.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
