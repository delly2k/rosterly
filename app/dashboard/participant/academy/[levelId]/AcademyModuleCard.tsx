"use client";

import Link from "next/link";
import { CheckCircle, Lock, ChevronRight } from "lucide-react";

export function AcademyModuleCard({
  levelId,
  module,
  isComplete,
  isStarted,
  isUnlocked,
}: {
  levelId: string;
  module: {
    id: string;
    order_index: number;
    title: string;
    description: string;
    has_quiz: boolean;
  };
  isComplete: boolean;
  isStarted: boolean;
  isUnlocked: boolean;
}) {
  const card = (
    <div
      className={`academy-module-card ${isUnlocked ? "academy-module-card--interactive" : ""}`}
      style={{
        background: "white",
        borderRadius: 12,
        border: `0.5px solid ${isComplete ? "var(--color-green-border)" : "var(--color-border)"}`,
        borderLeft: `3px solid ${isComplete ? "var(--color-green)" : isStarted ? "var(--color-gold)" : "var(--color-border)"}`,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: isUnlocked ? 1 : 0.5,
        cursor: isUnlocked ? "pointer" : "not-allowed",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          flexShrink: 0,
          background: isComplete
            ? "var(--color-green)"
            : isStarted
              ? "var(--color-gold)"
              : "#F0EEE8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isComplete ? 14 : 15,
          fontWeight: 700,
          color: isComplete || isStarted ? "white" : "var(--color-ink-muted)",
        }}
      >
        {isComplete ? (
          <CheckCircle size={18} color="white" />
        ) : isUnlocked ? (
          module.order_index
        ) : (
          <Lock size={14} color="var(--color-ink-hint)" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-ink-muted)" }}>
            Module {module.order_index}
          </span>
          {module.has_quiz && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "1px 6px",
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 500,
                background: "#EFF6FF",
                border: "0.5px solid #BFDBFE",
                color: "#2563EB",
              }}
            >
              Quiz
            </span>
          )}
          {isComplete && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "1px 6px",
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 500,
                background: "var(--color-green-light)",
                border: "0.5px solid var(--color-green-border)",
                color: "var(--color-green)",
              }}
            >
              Complete
            </span>
          )}
        </div>
        <div
          style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 3 }}
        >
          {module.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)", lineHeight: 1.5 }}>
          {module.description}
        </div>
      </div>

      <ChevronRight
        size={16}
        color={isUnlocked ? "var(--color-ink-hint)" : "transparent"}
      />
    </div>
  );

  if (!isUnlocked) {
    return <div style={{ textDecoration: "none", display: "block" }}>{card}</div>;
  }

  return (
    <Link
      href={`/dashboard/participant/academy/${levelId}/${module.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      {card}
    </Link>
  );
}
