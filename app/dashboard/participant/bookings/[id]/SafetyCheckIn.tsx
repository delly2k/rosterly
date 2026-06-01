"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export function SafetyCheckIn({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const record = (lat: number | null, lon: number | null) =>
        fetch("/api/safety/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, lat, lon }),
        });

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const res = await record(pos.coords.latitude, pos.coords.longitude);
            if (res.ok) setDone(true);
            setLoading(false);
          },
          async () => {
            const res = await record(null, null);
            if (res.ok) setDone(true);
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        const res = await record(null, null);
        if (res.ok) setDone(true);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: done ? "#F0FDF4" : "#F0FDF4",
        border: "0.5px solid rgba(22,163,74,0.3)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="var(--color-green)" />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-green)",
              }}
            >
              Safety check-in
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-ink-muted)",
                marginTop: 1,
              }}
            >
              {done
                ? "Check-in recorded — stay safe"
                : "Let us know you're okay during this gig"}
            </div>
          </div>
        </div>
        {!done && (
          <button
            type="button"
            onClick={() => void handleCheckIn()}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: "var(--color-green)",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              flexShrink: 0,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving…" : "I'm okay ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
