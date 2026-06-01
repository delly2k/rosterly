"use client";

import { useState } from "react";
import { AlertTriangle, Loader } from "lucide-react";
import { triggerSOS } from "./sos-actions";

export function SosButton({
  gigTitle,
  gigAddress,
}: {
  gigTitle?: string;
  gigAddress?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSOS() {
    setLoading(true);
    let lat = "";
    let lon = "";

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      lat = pos.coords.latitude.toString();
      lon = pos.coords.longitude.toString();
    } catch {
      // GPS failed — continue without it
    }

    const formData = new FormData();
    formData.append("lat", lat);
    formData.append("lon", lon);
    if (gigTitle) formData.append("gigTitle", gigTitle);
    if (gigAddress) formData.append("gigAddress", gigAddress);

    await triggerSOS(formData);
    setSent(true);
    setLoading(false);
    setConfirming(false);
  }

  if (sent) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid rgba(220,38,38,0.3)",
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <AlertTriangle size={18} color="#DC2626" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#DC2626" }}>
            SOS alert sent
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Admin notified · Emergency contact messaged · Stay safe
          </div>
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid rgba(220,38,38,0.3)",
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#DC2626",
            marginBottom: 8,
          }}
        >
          Confirm SOS alert?
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          This will notify admin and send an SMS to your emergency contact with your
          current GPS location.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => void handleSOS()}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              background: "#DC2626",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <Loader size={14} className="sos-loader-spin" />
            ) : (
              <AlertTriangle size={14} />
            )}
            {loading ? "Sending..." : "Yes, send SOS"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "white",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 8,
        background: "#FEF2F2",
        color: "#DC2626",
        border: "1px solid rgba(220,38,38,0.3)",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      <AlertTriangle size={16} /> SOS emergency
    </button>
  );
}
