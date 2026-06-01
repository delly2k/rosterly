import { ParticipantReputationCard } from "./ParticipantReputationCard";

export function ProfileReputationSection({
  reputationScore,
  averageRating,
  totalRatings,
  verified,
  gigsCompleted = 0,
}: {
  reputationScore: number;
  averageRating: number | null;
  totalRatings: number;
  verified: boolean;
  gigsCompleted?: number;
}) {
  return (
    <ParticipantReputationCard
      reputationScore={reputationScore}
      averageRating={averageRating}
      totalRatings={totalRatings}
      isVerified={verified}
      gigsCompleted={gigsCompleted}
    />
  );
}
