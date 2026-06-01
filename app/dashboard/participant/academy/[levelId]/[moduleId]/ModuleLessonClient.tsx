"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  CheckCircle,
  FileQuestion,
  ChevronRight,
} from "lucide-react";
import { markModuleComplete } from "../../actions";
import { LessonContent } from "./LessonContent";

type Question = {
  id: string;
  question: string;
  options: string;
  correct_answer: string;
  explanation: string;
};

type ModuleNav = { id: string; title: string } | null;

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

function QuizSection({
  questions,
  onComplete,
}: {
  questions: Question[];
  onComplete: (passed: boolean, score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleSubmit = () => {
    const r: Record<string, boolean> = {};
    let correct = 0;
    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correct_answer;
      r[q.id] = isCorrect;
      if (isCorrect) correct += 1;
    });
    const score = Math.round((correct / questions.length) * 100);
    setResults(r);
    setSubmitted(true);
    onComplete(score >= 70, score);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "0.5px solid var(--color-border)",
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <FileQuestion size={16} color="#2563EB" />
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>Module quiz</div>
      </div>

      {questions.map((q, i) => (
        <div
          key={q.id}
          style={{
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom:
              i < questions.length - 1 ? "0.5px solid var(--color-border)" : "none",
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)", marginBottom: 12 }}
          >
            {i + 1}. {q.question}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {parseOptions(q.options).map((option) => {
              const selected = answers[q.id] === option;
              const isCorrect = submitted && option === q.correct_answer;
              const isWrong = submitted && selected && !isCorrect;
              return (
                <div
                  key={option}
                  role="button"
                  tabIndex={submitted ? -1 : 0}
                  onClick={() =>
                    !submitted && setAnswers((prev) => ({ ...prev, [q.id]: option }))
                  }
                  onKeyDown={(e) => {
                    if (!submitted && (e.key === "Enter" || e.key === " ")) {
                      setAnswers((prev) => ({ ...prev, [q.id]: option }));
                    }
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    cursor: submitted ? "default" : "pointer",
                    border: `1px solid ${isCorrect ? "var(--color-green)" : isWrong ? "var(--color-danger)" : selected ? "var(--color-gold)" : "var(--color-border)"}`,
                    background: isCorrect
                      ? "var(--color-green-light)"
                      : isWrong
                        ? "var(--color-danger-light)"
                        : selected
                          ? "var(--color-gold-light)"
                          : "white",
                    fontSize: 13,
                    color: "var(--color-ink)",
                  }}
                >
                  {option}
                </div>
              );
            })}
          </div>
          {submitted && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: results[q.id]
                  ? "var(--color-green-light)"
                  : "var(--color-danger-light)",
                fontSize: 12,
                color: results[q.id] ? "var(--color-green)" : "var(--color-danger)",
              }}
            >
              {results[q.id] ? "✓ Correct — " : "✗ Incorrect — "}
              {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            background:
              Object.keys(answers).length < questions.length
                ? "#F4F3EF"
                : "var(--color-gold)",
            color:
              Object.keys(answers).length < questions.length
                ? "var(--color-ink-muted)"
                : "white",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor:
              Object.keys(answers).length < questions.length ? "not-allowed" : "pointer",
          }}
        >
          Submit answers
        </button>
      )}
    </div>
  );
}

export default function ModuleLessonClient({
  levelId,
  levelOrder,
  levelTitle,
  module,
  questions,
  progress,
  prevModule,
  nextModule,
  initialComplete,
  initialQuizPassed,
}: {
  levelId: string;
  levelOrder: number;
  levelTitle: string;
  module: {
    id: string;
    title: string;
    order_index: number;
    content_html: string;
    video_url: string | null;
    has_quiz: boolean;
  };
  questions: Question[];
  progress: {
    video_watched: boolean;
    quiz_passed: boolean;
    completed_at: string | null;
  } | null;
  prevModule: ModuleNav;
  nextModule: ModuleNav;
  initialComplete: boolean;
  initialQuizPassed: boolean;
}) {
  const router = useRouter();
  const [quizPassed, setQuizPassed] = useState(initialQuizPassed);
  const [quizScore, setQuizScore] = useState(0);
  const [isComplete, setIsComplete] = useState(initialComplete);
  const [saving, setSaving] = useState(false);

  const handleQuizComplete = (passed: boolean, score: number) => {
    setQuizPassed(passed);
    setQuizScore(score);
  };

  const handleMarkComplete = async () => {
    setSaving(true);
    await markModuleComplete(module.id, quizPassed || !module.has_quiz, quizScore);
    setIsComplete(true);
    setSaving(false);
    router.refresh();
  };

  const canMarkComplete = (quizPassed || !module.has_quiz) && !isComplete;

  const sidebarSteps = [
    { label: "Watch video", done: progress?.video_watched, pending: !module.video_url },
    { label: "Read lesson", done: true },
    { label: "Complete quiz", done: progress?.quiz_passed ?? quizPassed, hidden: !module.has_quiz },
    { label: "Mark complete", done: !!(progress?.completed_at || isComplete) },
  ].filter((s) => !s.hidden);

  return (
    <div style={{ padding: "32px 40px" }}>
      <Link
        href={`/dashboard/participant/academy/${levelId}`}
        className="academy-back-link"
        style={{
          fontSize: 13,
          color: "var(--color-gold)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 20,
        }}
      >
        ← Back to Level {levelOrder}
      </Link>

      <div
        className="academy-lesson-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
              marginBottom: 6,
            }}
          >
            Module {module.order_index} · {levelTitle}
          </div>
          <div
            style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", marginBottom: 24 }}
          >
            {module.title}
          </div>

          {module.video_url ? (
            <video
              controls
              className="academy-video-placeholder"
              style={{ width: "100%", borderRadius: 12, marginBottom: 24, height: 240 }}
            >
              <source src={module.video_url} />
            </video>
          ) : (
            <div
              className="academy-video-placeholder"
              style={{
                background: "#1A1D23",
                borderRadius: 12,
                height: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <PlayCircle
                size={48}
                color="rgba(200,151,58,0.4)"
                style={{ marginBottom: 12 }}
              />
              <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                Video coming soon
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                Continue reading the lesson below
              </div>
            </div>
          )}

          <LessonContent html={module.content_html} />

          {module.has_quiz && questions.length > 0 && (
            <QuizSection questions={questions} onComplete={handleQuizComplete} />
          )}

          {canMarkComplete && (
            <button
              type="button"
              onClick={() => void handleMarkComplete()}
              disabled={saving}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 10,
                background: "var(--color-green)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: saving ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <CheckCircle size={16} /> {saving ? "Saving…" : "Mark module complete"}
            </button>
          )}

          {isComplete && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle
                size={32}
                color="var(--color-green)"
                style={{ margin: "0 auto 8px", display: "block" }}
              />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-green)" }}>
                Module complete
              </div>
              {nextModule ? (
                <Link
                  href={`/dashboard/participant/academy/${levelId}/${nextModule.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 12,
                    fontSize: 13,
                    color: "var(--color-gold)",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Next: {nextModule.title} <ChevronRight size={13} />
                </Link>
              ) : (
                <Link
                  href={`/dashboard/participant/academy/${levelId}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 12,
                    fontSize: 13,
                    color: "var(--color-gold)",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Back to level overview <ChevronRight size={13} />
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="academy-lesson-sidebar" style={{ position: "sticky", top: 72 }}>
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: 16,
              marginBottom: 14,
            }}
          >
            <div
              style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)", marginBottom: 12 }}
            >
              This module
            </div>
            {sidebarSteps.map(({ label, done, pending }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "0.5px solid var(--color-border)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: done ? "var(--color-green)" : "#F0EEE8",
                    border: `1px solid ${done ? "var(--color-green)" : "var(--color-border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {done && <CheckCircle size={10} color="white" />}
                </div>
                <span
                  style={{
                    color: done
                      ? "var(--color-green)"
                      : pending
                        ? "var(--color-ink-hint)"
                        : "var(--color-ink-muted)",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {label}
                  {pending ? " (coming soon)" : ""}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {prevModule && (
              <Link
                href={`/dashboard/participant/academy/${levelId}/${prevModule.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "white",
                  border: "0.5px solid var(--color-border)",
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  textDecoration: "none",
                }}
              >
                ← {prevModule.title}
              </Link>
            )}
            {nextModule && (
              <Link
                href={`/dashboard/participant/academy/${levelId}/${nextModule.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--color-gold-light)",
                  border: "0.5px solid var(--color-gold-border)",
                  fontSize: 12,
                  color: "var(--color-gold)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <span>{nextModule.title}</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
