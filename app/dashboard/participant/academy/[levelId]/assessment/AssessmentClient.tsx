"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, XCircle, Award, AlertTriangle } from "lucide-react";
import { submitAssessment } from "../../actions";

type Question = {
  id: string;
  question: string;
  options: string;
  correct_answer: string;
  explanation: string;
};

function parseOptions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((o): o is string => typeof o === "string")
      : [];
  } catch {
    return [];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function AssessmentClient({
  levelId,
  assessment,
  questions: rawQuestions,
}: {
  levelId: string;
  assessment: {
    id: string;
    title: string;
    pass_mark: number;
    time_limit_minutes: number;
  };
  questions: Question[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"instructions" | "in_progress" | "submitted">(
    "instructions"
  );
  const [questions] = useState(() => shuffle(rawQuestions));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(assessment.time_limit_minutes * 60);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    questionResults: Record<string, boolean>;
    certificateCode?: string;
  } | null>(null);

  const handleSubmit = useCallback(async () => {
    let correct = 0;
    const questionResults: Record<string, boolean> = {};
    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correct_answer;
      questionResults[q.id] = isCorrect;
      if (isCorrect) correct += 1;
    });
    const score =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= assessment.pass_mark;

    const result = await submitAssessment({
      assessmentId: assessment.id,
      levelId,
      answers,
      score,
      passed,
    });

    setResults({
      score,
      passed,
      questionResults,
      certificateCode: result.certificateCode,
    });
    setPhase("submitted");
    if (passed) router.refresh();
  }, [answers, assessment.id, assessment.pass_mark, levelId, questions, router]);

  useEffect(() => {
    if (phase !== "in_progress") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          void handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, handleSubmit]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 40px" }}>
      <Link
        href={`/dashboard/participant/academy/${levelId}`}
        style={{
          fontSize: 13,
          color: "var(--color-gold)",
          textDecoration: "none",
          marginBottom: 20,
          display: "inline-block",
        }}
      >
        ← Back to level
      </Link>

      {phase === "instructions" && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: "0.5px solid var(--color-border)",
            padding: "32px 40px",
            textAlign: "center",
          }}
        >
          <GraduationCapPlaceholder />
          <div
            style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}
          >
            {assessment.title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-ink-muted)",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            {questions.length} questions · {assessment.pass_mark}% required to pass ·{" "}
            {assessment.time_limit_minutes} minute time limit
          </div>
          <div
            style={{
              background: "var(--color-gold-light)",
              border: "0.5px solid var(--color-gold-border)",
              borderRadius: 10,
              padding: "14px 18px",
              fontSize: 12,
              color: "var(--color-ink-muted)",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <AlertTriangle
              size={14}
              color="var(--color-gold)"
              style={{ display: "inline", marginRight: 6 }}
            />
            Questions are shuffled. You must pass to earn your certificate. The timer starts
            when you begin.
          </div>
          <button
            type="button"
            onClick={() => setPhase("in_progress")}
            style={{
              padding: "14px 32px",
              borderRadius: 10,
              background: "var(--color-gold)",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Begin assessment
          </button>
        </div>
      )}

      {phase === "in_progress" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              padding: "12px 16px",
              background: "white",
              borderRadius: 10,
              border: "0.5px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
              {assessment.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 700,
                color: timeLeft < 300 ? "var(--color-danger)" : "var(--color-gold)",
              }}
            >
              <Clock size={16} /> {timerLabel}
            </div>
          </div>

          {questions.map((q, i) => (
            <div
              key={q.id}
              style={{
                background: "white",
                borderRadius: 12,
                border: "0.5px solid var(--color-border)",
                padding: "20px 24px",
                marginBottom: 12,
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)", marginBottom: 12 }}
              >
                {i + 1}. {q.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parseOptions(q.options).map((option) => (
                  <div
                    key={option}
                    role="button"
                    tabIndex={0}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1px solid ${answers[q.id] === option ? "var(--color-gold)" : "var(--color-border)"}`,
                      background:
                        answers[q.id] === option ? "var(--color-gold-light)" : "white",
                      fontSize: 13,
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={Object.keys(answers).length < questions.length}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "14px 0",
              borderRadius: 10,
              background:
                Object.keys(answers).length < questions.length
                  ? "#F4F3EF"
                  : "var(--color-green)",
              color:
                Object.keys(answers).length < questions.length
                  ? "var(--color-ink-muted)"
                  : "white",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor:
                Object.keys(answers).length < questions.length ? "not-allowed" : "pointer",
            }}
          >
            Submit assessment
          </button>
        </>
      )}

      {phase === "submitted" && results && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: `2px solid ${results.passed ? "var(--color-green)" : "var(--color-danger)"}`,
            padding: "32px 40px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {results.passed ? (
              <CheckCircle
                size={48}
                color="var(--color-green)"
                style={{ margin: "0 auto 12px", display: "block" }}
              />
            ) : (
              <XCircle
                size={48}
                color="var(--color-danger)"
                style={{ margin: "0 auto 12px", display: "block" }}
              />
            )}
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: results.passed ? "var(--color-green)" : "var(--color-danger)",
              }}
            >
              {results.score}%
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-ink)", marginTop: 8 }}>
              {results.passed ? "You passed!" : "Not quite — try again"}
            </div>
            {results.passed && results.certificateCode && (
              <Link
                href={`/dashboard/participant/academy/certificate/${results.certificateCode}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "var(--color-gold)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Award size={16} /> View certificate
              </Link>
            )}
          </div>

          {questions.map((q, i) => (
            <div
              key={q.id}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < questions.length - 1 ? "0.5px solid var(--color-border)" : "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                {results.questionResults[q.id] ? "✓" : "✗"} {q.question}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{q.explanation}</div>
            </div>
          ))}

          {!results.passed && (
            <button
              type="button"
              onClick={() => {
                setPhase("instructions");
                setAnswers({});
                setTimeLeft(assessment.time_limit_minutes * 60);
                setResults(null);
              }}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "12px 0",
                borderRadius: 8,
                background: "var(--color-gold)",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GraduationCapPlaceholder() {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "var(--color-gold-light)",
        border: "1px solid var(--color-gold-border)",
        margin: "0 auto 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}
    >
      🎓
    </div>
  );
}
