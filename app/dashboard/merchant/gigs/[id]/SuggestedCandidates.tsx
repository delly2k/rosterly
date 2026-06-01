"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { inviteParticipant } from "./invitation-actions";
import EmptyState from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

export type MerchantMatchCandidate = {
  participantId: string;
  fullName: string;
  score: number;
  reasons: string[];
  alreadyInvited: boolean;
};

export function SuggestedCandidates({
  gigId,
  applicationsCount,
  applicationsPanel,
}: {
  gigId: string;
  applicationsCount: number;
  applicationsPanel: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"applications" | "candidates">("applications");
  const [candidates, setCandidates] = useState<MerchantMatchCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);

  async function loadCandidates() {
    setLoadingCandidates(true);
    try {
      const res = await fetch(`/api/matching/merchant?gigId=${gigId}`);
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.scores ?? []);
        setCandidatesLoaded(true);
      }
    } finally {
      setLoadingCandidates(false);
    }
  }

  return (
    <section
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        padding: "24px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          background: "#F4F3EF",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          width: "fit-content",
        }}
      >
        {(["applications", "candidates"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              if (tab === "candidates" && !candidatesLoaded) void loadCandidates();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "var(--color-ink)" : "var(--color-ink-muted)",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab === "applications"
              ? `Applications (${applicationsCount})`
              : "Suggested candidates"}
          </button>
        ))}
      </div>

      {activeTab === "applications" ? (
        applicationsPanel
      ) : (
        <div>
          {loadingCandidates ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--color-ink-muted)",
                fontSize: 13,
              }}
            >
              <Sparkles
                size={20}
                color="var(--color-gold)"
                style={{ margin: "0 auto 8px", display: "block" }}
              />
              <div>Finding the best matches for your gig...</div>
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No suggested candidates yet"
              description="Try again after more verified participants join, or share your gig link"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.participantId}
                  style={{
                    background: "white",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--color-gold-light)",
                      border: "1px solid var(--color-gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-gold)",
                      flexShrink: 0,
                    }}
                  >
                    {candidate.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        marginBottom: 4,
                      }}
                    >
                      {candidate.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-muted)",
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {candidate.reasons.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          style={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <span style={{ color: "var(--color-green)", fontSize: 10 }}>✓</span>{" "}
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color:
                          candidate.score >= 70
                            ? "var(--color-green)"
                            : candidate.score >= 40
                              ? "var(--color-gold)"
                              : "var(--color-ink-muted)",
                      }}
                    >
                      {candidate.score}%
                    </div>
                    <div style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>match</div>
                  </div>

                  {candidate.alreadyInvited ? (
                    <div
                      style={{
                        padding: "7px 16px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        background: "var(--color-green-light)",
                        border: "0.5px solid var(--color-green-border)",
                        color: "var(--color-green)",
                        flexShrink: 0,
                      }}
                    >
                      Invited ✓
                    </div>
                  ) : (
                    <form action={inviteParticipant}>
                      <input type="hidden" name="gigId" value={gigId} />
                      <input
                        type="hidden"
                        name="participantId"
                        value={candidate.participantId}
                      />
                      <input type="hidden" name="matchScore" value={candidate.score} />
                      <button
                        type="submit"
                        style={{
                          padding: "7px 16px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "var(--color-gold)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Send size={12} /> Invite
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
