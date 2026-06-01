"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { submitRating } from "@/app/dashboard/actions/ratings";
import { Button } from "@/components/ui/Button";

type RatingModalProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  gigTitle: string;
  rateeName: string;
};

export function RatingModal({
  open,
  onClose,
  bookingId,
  gigTitle,
  rateeName,
}: RatingModalProps) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setScore(0);
      setHoverScore(0);
      setComment("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!open) return null;

  const displayScore = hoverScore || score;

  async function handleSubmit() {
    if (score < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitRating({ bookingId, score, comment });
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setToast("Rating submitted");
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1200);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-modal-title"
      >
        <div className="surface-card relative w-full max-w-md p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 id="rating-modal-title" className="portal-section-title pr-8 text-lg">
            Rate your experience
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{gigTitle}</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">{rateeName}</p>

          <div className="mt-6 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                onMouseEnter={() => setHoverScore(value)}
                onMouseLeave={() => setHoverScore(0)}
                className="rounded p-1 transition-transform hover:scale-110"
                aria-label={`${value} star${value !== 1 ? "s" : ""}`}
              >
                <Star
                  className="h-8 w-8"
                  fill={value <= displayScore ? "var(--color-gold)" : "transparent"}
                  stroke={value <= displayScore ? "var(--color-gold)" : "var(--color-border)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label
              htmlFor="rating-comment"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Comment (optional)
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Share how the gig went…"
              className="input-refined w-full resize-none text-sm"
            />
            <p className="mt-1 text-right text-xs text-[var(--color-ink-hint)]">
              {comment.length}/200
            </p>
          </div>

          {error && (
            <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting…" : "Submit rating"}
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

type BookingRatingPromptProps = {
  bookingId: string;
  gigTitle: string;
  rateeName: string;
  autoOpen?: boolean;
};

export function BookingRatingPrompt({
  bookingId,
  gigTitle,
  rateeName,
  autoOpen = false,
}: BookingRatingPromptProps) {
  const [open, setOpen] = useState(autoOpen);

  return (
    <>
      {!autoOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-portal-primary text-sm"
        >
          Rate this participant
        </button>
      )}
      <RatingModal
        open={open}
        onClose={() => setOpen(false)}
        bookingId={bookingId}
        gigTitle={gigTitle}
        rateeName={rateeName}
      />
    </>
  );
}
