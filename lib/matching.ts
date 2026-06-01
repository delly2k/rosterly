export type MatchBreakdown = {
  location: number;
  skills: number;
  availability: number;
  reputation: number;
  experience: number;
};

export type MatchScore = {
  participantId: string;
  fullName: string;
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
};

export type GigMatchBreakdown = {
  location: number;
  skills: number;
  availability: number;
  reputation: number;
};

export type GigMatchScore = {
  gigId: string;
  title: string;
  score: number;
  breakdown: GigMatchBreakdown;
  reasons: string[];
};

type AvailabilityDay = {
  available: boolean;
  from: string;
  to: string;
};

type ParticipantProfile = {
  user_id: string;
  full_name?: string | null;
  skills?: unknown;
  location_general?: string | null;
  availability?: Record<string, AvailabilityDay> | null;
  reputation_score?: number | null;
};

type GigRow = {
  id: string;
  title: string;
  duties?: unknown;
  location_general?: string | null;
  location_parish?: string | null;
  start_time?: string | null;
};

type CompletedBooking = {
  participant_user_id: string;
  gigs?: { title?: string | null } | { title?: string | null }[] | null;
};

const KINGSTON_AREA = ["kingston", "st. andrew", "portmore", "st. catherine"];

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function skillsOverlapScore(
  participantSkills: string[],
  gigDuties: string[],
  maxPoints: number
): number {
  if (participantSkills.length === 0 || gigDuties.length === 0) return 0;
  let matches = 0;
  for (const duty of gigDuties) {
    if (
      participantSkills.some(
        (skill) =>
          duty.includes(skill) ||
          skill.includes(duty) ||
          (duty.includes("spirits") && skill.includes("spirits")) ||
          (duty.includes("sampling") && skill.includes("sampling")) ||
          (duty.includes("brand") && skill.includes("brand")) ||
          (duty.includes("event") && skill.includes("event")) ||
          (duty.includes("demo") && skill.includes("demo"))
      )
    ) {
      matches++;
    }
  }
  return Math.round((matches / gigDuties.length) * maxPoints);
}

export function scoreParticipantForGig(
  participant: ParticipantProfile,
  gig: GigRow,
  completedGigs: CompletedBooking[]
): MatchScore {
  const breakdown: MatchBreakdown = {
    location: 0,
    skills: 0,
    availability: 0,
    reputation: 0,
    experience: 0,
  };
  const reasons: string[] = [];

  const gigParish = gig.location_parish?.toLowerCase();
  const participantParish = participant.location_general?.toLowerCase();
  if (gigParish && participantParish) {
    if (
      participantParish.includes(gigParish) ||
      gigParish.includes(participantParish)
    ) {
      breakdown.location = 25;
      reasons.push(`Based in ${gig.location_parish}`);
    } else {
      const gigIsKingston = KINGSTON_AREA.some((a) => gigParish.includes(a));
      const participantIsKingston = KINGSTON_AREA.some((a) =>
        participantParish.includes(a)
      );
      if (gigIsKingston && participantIsKingston) {
        breakdown.location = 15;
        reasons.push("In the Kingston metro area");
      } else {
        breakdown.location = 5;
      }
    }
  }

  const participantSkills = parseStringArray(participant.skills).map((s) =>
    s.toLowerCase()
  );
  const gigDuties = parseStringArray(gig.duties).map((d) => d.toLowerCase());
  breakdown.skills = skillsOverlapScore(participantSkills, gigDuties, 25);
  if (breakdown.skills >= 20) reasons.push("Strong skills match for this gig type");
  else if (breakdown.skills >= 10) reasons.push("Some relevant skills");

  if (gig.start_time) {
    const gigStart = new Date(gig.start_time);
    const dayName = gigStart
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const gigHour = gigStart.getHours();
    const availability = participant.availability;
    const day = availability?.[dayName];
    if (day?.available) {
      const fromHour = parseInt(day.from.split(":")[0], 10);
      const toHour = parseInt(day.to.split(":")[0], 10);
      if (gigHour >= fromHour && gigHour <= toHour) {
        breakdown.availability = 20;
        reasons.push("Available on the gig day and time");
      } else {
        breakdown.availability = 10;
        reasons.push("Available on the gig day");
      }
    }
  }

  const repScore = participant.reputation_score ?? 0;
  breakdown.reputation = Math.round((repScore / 1000) * 20);
  if (repScore >= 700) reasons.push(`Elite reputation score (${repScore})`);
  else if (repScore >= 400) reasons.push(`Established reputation score (${repScore})`);
  else if (repScore > 0) reasons.push(`Rising reputation score (${repScore})`);

  if (completedGigs.length > 0) {
    const gigTitleLower = gig.title.toLowerCase();
    const categoryKeyword = gigTitleLower.includes("spirits")
      ? "spirits"
      : gigTitleLower.includes("fmcg")
        ? "fmcg"
        : gigTitleLower.includes("event")
          ? "event"
          : "";
    const hasCategory =
      categoryKeyword &&
      completedGigs.some((cg) => {
        const g = Array.isArray(cg.gigs) ? cg.gigs[0] : cg.gigs;
        return g?.title?.toLowerCase().includes(categoryKeyword);
      });
    if (hasCategory) {
      breakdown.experience = 10;
      reasons.push("Has experience with similar gig types");
    } else if (completedGigs.length >= 3) {
      breakdown.experience = 5;
      reasons.push(`${completedGigs.length} gigs completed`);
    }
  }

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    participantId: participant.user_id,
    fullName: participant.full_name ?? "Unknown",
    score,
    breakdown,
    reasons,
  };
}

export function scoreGigForParticipant(
  gig: GigRow,
  participant: ParticipantProfile
): GigMatchScore {
  const breakdown: GigMatchBreakdown = {
    location: 0,
    skills: 0,
    availability: 0,
    reputation: 0,
  };
  const reasons: string[] = [];

  const gigParish =
    gig.location_parish?.toLowerCase() ?? gig.location_general?.toLowerCase() ?? "";
  const participantLocation = participant.location_general?.toLowerCase() ?? "";
  if (gigParish && participantLocation) {
    if (
      participantLocation.includes(gigParish) ||
      gigParish.includes(participantLocation)
    ) {
      breakdown.location = 25;
      reasons.push("Near you");
    } else {
      const gigIsKingston = KINGSTON_AREA.some((a) => gigParish.includes(a));
      const participantIsKingston = KINGSTON_AREA.some((a) =>
        participantLocation.includes(a)
      );
      if (gigIsKingston && participantIsKingston) {
        breakdown.location = 15;
        reasons.push("Kingston area");
      }
    }
  }

  const participantSkills = parseStringArray(participant.skills).map((s) =>
    s.toLowerCase()
  );
  const gigDuties = parseStringArray(gig.duties).map((d) => d.toLowerCase());
  breakdown.skills = skillsOverlapScore(participantSkills, gigDuties, 35);
  if (breakdown.skills >= 25) reasons.push("Matches your skills");

  if (gig.start_time) {
    const gigStart = new Date(gig.start_time);
    const dayName = gigStart
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const availability = participant.availability;
    if (availability?.[dayName]?.available) {
      breakdown.availability = 25;
      reasons.push("You're available");
    }
  }

  breakdown.reputation = Math.min(Math.round((participant.reputation_score ?? 0) / 50), 15);

  const score = Math.min(
    Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0)),
    100
  );

  return {
    gigId: gig.id,
    title: gig.title,
    score,
    breakdown,
    reasons,
  };
}
