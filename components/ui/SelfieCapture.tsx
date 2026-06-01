"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle, X, AlertCircle } from "lucide-react";

type Props = {
  onCapture: (file: File, previewUrl: string) => void;
  onClear: () => void;
  preview: string | null;
  disabled?: boolean;
};

export default function SelfieCapture({ onCapture, onClear, preview, disabled }: Props) {
  const [mode, setMode] = useState<"idle" | "camera" | "captured">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const startCamera = useCallback(async () => {
    if (disabled) return;
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setMode("camera");
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      } else if (name === "NotFoundError") {
        setError("No camera found. Please use the file upload option instead.");
      } else {
        setError("Could not access camera. Please try uploading a photo instead.");
      }
    }
  }, [disabled]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (mode === "camera") setMode("idle");
  }, [stream, mode]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const url = canvas.toDataURL("image/jpeg", 0.9);
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
        setMode("captured");
        onCapture(file, url);
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, stream]);

  const captureWithCountdown = () => {
    setCountdown(3);
    const tick = (n: number) => {
      if (n === 0) {
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(n);
        setTimeout(() => tick(n - 1), 1000);
      }
    };
    setTimeout(() => tick(2), 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    setMode("captured");
    onCapture(file, url);
    e.target.value = "";
  };

  const handleRetake = () => {
    onClear();
    setMode("idle");
    setError(null);
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play();
    }
  }, [stream]);

  useEffect(() => {
    if (!preview && mode === "captured") {
      setMode("idle");
    }
    if (preview && mode === "idle") {
      setMode("captured");
    }
  }, [preview, mode]);

  return (
    <div>
      {mode === "camera" && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: 160,
              objectFit: "cover",
              borderRadius: 10,
              border: "0.5px solid var(--color-border)",
              transform: "scaleX(-1)",
            }}
          />

          {countdown !== null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {countdown}
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 90,
                height: 120,
                border: "2px dashed rgba(200,151,58,0.6)",
                borderRadius: "50%",
                boxShadow: "0 0 0 999px rgba(0,0,0,0.15)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={stopCamera}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.5)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close camera"
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {mode === "captured" && preview && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <img
            src={preview}
            alt="Selfie preview"
            style={{
              width: "100%",
              height: 160,
              objectFit: "cover",
              borderRadius: 10,
              border: "0.5px solid var(--color-green)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "var(--color-green)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CheckCircle size={10} aria-hidden />
            Captured
          </div>
        </div>
      )}

      {mode === "idle" && !preview && (
        <div
          style={{
            height: 80,
            background: "#FAFAF8",
            border: "1.5px dashed var(--color-border)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            color: "var(--color-ink-hint)",
            fontSize: 12,
          }}
        >
          Camera preview will appear here
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 12,
            background: "var(--color-danger-light)",
            border: "0.5px solid rgba(220,38,38,0.2)",
            fontSize: 12,
            color: "var(--color-danger)",
          }}
          role="alert"
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
          {error}
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          color: "var(--color-ink-muted)",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        ✓ Face clearly visible &nbsp; ✓ Good lighting &nbsp; ✓ No glasses or filters
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={isMobile ? "user" : undefined}
        onChange={handleFileUpload}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {mode === "camera" ? (
        <button
          type="button"
          onClick={captureWithCountdown}
          disabled={countdown !== null || disabled}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 8,
            background: "var(--color-gold)",
            color: "white",
            border: "none",
            fontWeight: 600,
            fontSize: 13,
            cursor: countdown !== null || disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <Camera size={14} aria-hidden />
          {countdown !== null ? `Taking photo in ${countdown}...` : "Take photo"}
        </button>
      ) : mode === "captured" ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleRetake}
            disabled={disabled}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              background: "white",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              fontSize: 13,
              fontWeight: 500,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <RefreshCw size={13} aria-hidden />
            Retake
          </button>
          <div
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              background: "var(--color-green-light)",
              border: "0.5px solid var(--color-green-border)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={13} aria-hidden />
            {disabled ? "Saving…" : "Photo saved"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 8,
              background: "white",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              fontSize: 13,
              fontWeight: 500,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <Camera size={14} aria-hidden />
            Open camera
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "9px 0",
              borderRadius: 8,
              background: "transparent",
              color: "var(--color-ink-muted)",
              border: "none",
              fontSize: 12,
              fontWeight: 500,
              cursor: disabled ? "not-allowed" : "pointer",
              textDecoration: "underline",
              opacity: disabled ? 0.7 : 1,
            }}
          >
            {isMobile ? "Use device camera app instead" : "Upload a photo instead"}
          </button>
        </div>
      )}
    </div>
  );
}
