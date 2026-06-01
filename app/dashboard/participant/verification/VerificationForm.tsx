"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import {
  verificationDocPath,
  VERIFICATION_DOCS_BUCKET,
} from "@/lib/storage";
import { submitVerification } from "@/app/dashboard/participant/actions";
import SelfieCapture from "@/components/ui/SelfieCapture";

type VerificationFormProps = {
  latestStatus?: string;
};

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function VerificationForm({ latestStatus }: VerificationFormProps) {
  const router = useRouter();
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idDocPath, setIdDocPath] = useState<string | null>(null);
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState<"id" | "selfie" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadFile(
    file: File,
    type: "id_doc" | "selfie"
  ): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}.${ext}`;
    const path = verificationDocPath(user.id, type, filename);

    const { error } = await supabase.storage
      .from(VERIFICATION_DOCS_BUCKET)
      .upload(path, file, { upsert: true });

    if (error) return null;
    return path;
  }

  async function handleIdFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitError(null);

    const url = URL.createObjectURL(file);

    if (idPreview) URL.revokeObjectURL(idPreview);
    setIdFile(file);
    setIdPreview(isPdfFile(file) ? null : url);
    setIdDocPath(null);
    setUploading("id");
    const path = await uploadFile(file, "id_doc");
    setIdDocPath(path);
    if (!path) {
      setSubmitError("Could not upload ID document. Please try again.");
      setIdFile(null);
      if (!isPdfFile(file)) URL.revokeObjectURL(url);
      setIdPreview(null);
    }
    setUploading(null);

    e.target.value = "";
  }

  async function handleSelfieCapture(file: File, url: string) {
    setSubmitError(null);
    if (selfiePreview?.startsWith("blob:")) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(file);
    setSelfiePreview(url);
    setSelfiePath(null);
    setUploading("selfie");
    const path = await uploadFile(file, "selfie");
    setSelfiePath(path);
    if (!path) {
      setSubmitError("Could not upload selfie. Please try again.");
      setSelfieFile(null);
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      setSelfiePreview(null);
    }
    setUploading(null);
  }

  function clearId() {
    if (idPreview) URL.revokeObjectURL(idPreview);
    setIdFile(null);
    setIdPreview(null);
    setIdDocPath(null);
  }

  function clearSelfie() {
    if (selfiePreview?.startsWith("blob:")) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(null);
    setSelfiePreview(null);
    setSelfiePath(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!agreed) {
      setSubmitError("You must accept the verification disclaimer.");
      return;
    }
    if (!idDocPath || !selfiePath) {
      setSubmitError("Please upload both ID document and selfie.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitVerification(idDocPath, selfiePath);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not submit verification. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const rejected = latestStatus === "rejected";
  const idReady = !!idDocPath && !!idFile;
  const selfieReady = !!selfiePath && !!selfieFile;
  const canSubmit = idReady && selfieReady && agreed && !isSubmitting && !uploading;

  return (
    <form onSubmit={onSubmit} className="w-full space-y-6">
      {rejected && (
        <div
          className="surface-card border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] p-4 text-sm text-[var(--color-warning)]"
          role="status"
        >
          Your previous verification was rejected. You may submit again with new documents.
        </div>
      )}

      {submitError && (
        <div
          className="surface-card border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="surface-card overflow-hidden">
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #C8973A, #D4A843, #A07828)",
          }}
        />
        <div className="space-y-6 p-4 sm:p-6">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            maxWidth: 580,
            margin: "0 auto 28px",
          }}
        >
          {(
            [
              { n: 1, label: "Upload ID", done: idReady },
              { n: 2, label: "Upload selfie", done: selfieReady },
              { n: 3, label: "Submit", done: false },
            ] as const
          ).map(({ n, label, done }, i, arr) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                flex: i < arr.length - 1 ? 1 : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: done ? "var(--color-green)" : "var(--color-gold-light)",
                    border: `1.5px solid ${done ? "var(--color-green)" : "var(--color-gold-border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: done ? "white" : "var(--color-gold)",
                  }}
                >
                  {done ? <CheckCircle size={14} color="white" aria-hidden /> : n}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--color-ink-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--color-border)",
                    margin: "0 12px",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            maxWidth: 580,
            margin: "0 auto 16px",
          }}
        >
          {/* ID Document */}
          <div
            style={{
              background: "var(--color-card)",
              borderRadius: 12,
              border: `0.5px solid ${idReady ? "var(--color-green-border)" : "var(--color-border)"}`,
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}
          >
            <div
              style={{
                height: 3,
                background: idReady ? "var(--color-green)" : "var(--color-gold)",
              }}
            />
            <div style={{ padding: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: idReady ? "var(--color-green-light)" : "var(--color-gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText
                    size={16}
                    color={idReady ? "var(--color-green)" : "var(--color-gold)"}
                    aria-hidden
                  />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                    ID document
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>
                    Passport or driver&apos;s licence
                  </div>
                </div>
                {idReady && (
                  <CheckCircle
                    size={16}
                    color="var(--color-green)"
                    style={{ marginLeft: "auto" }}
                    aria-hidden
                  />
                )}
              </div>

              {idFile ? (
                <div style={{ position: "relative", marginBottom: 12 }}>
                  {idPreview ? (
                    <img
                      src={idPreview}
                      alt="ID preview"
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "0.5px solid var(--color-border)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 8,
                        border: "0.5px solid var(--color-border)",
                        background: "#FAFAF8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        color: "var(--color-ink-muted)",
                        fontSize: 12,
                      }}
                    >
                      <FileText size={20} aria-hidden />
                      PDF uploaded
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearId}
                    disabled={uploading === "id"}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.5)",
                      border: "none",
                      color: "white",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: uploading === "id" ? "not-allowed" : "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Remove ID document"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    height: 80,
                    background: "#FAFAF8",
                    border: "1.5px dashed var(--color-border)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    color: "var(--color-ink-hint)",
                    fontSize: 12,
                  }}
                >
                  No file selected
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
                ✓ Full document visible &nbsp; ✓ Clear and unblurred &nbsp; ✓ Not expired
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 0",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  background: idReady ? "var(--color-green-light)" : "white",
                  border: `0.5px solid ${idReady ? "var(--color-green-border)" : "var(--color-border)"}`,
                  color: idReady ? "var(--color-green)" : "var(--color-ink)",
                  cursor: uploading === "id" ? "wait" : "pointer",
                  width: "100%",
                  opacity: uploading === "id" ? 0.7 : 1,
                }}
              >
                <Upload size={13} aria-hidden />
                {uploading === "id"
                  ? "Uploading…"
                  : idFile
                    ? "Replace ID"
                    : "Upload ID document"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleIdFileChange}
                  style={{ display: "none" }}
                  disabled={uploading === "id"}
                />
              </label>
            </div>
          </div>

          {/* Selfie */}
          <div
            style={{
              background: "var(--color-card)",
              borderRadius: 12,
              border: `0.5px solid ${selfieReady ? "var(--color-green-border)" : "var(--color-border)"}`,
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}
          >
            <div
              style={{
                height: 3,
                background: selfieReady ? "var(--color-green)" : "var(--color-gold)",
              }}
            />
            <div style={{ padding: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: selfieReady
                      ? "var(--color-green-light)"
                      : "var(--color-gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera
                    size={16}
                    color={selfieReady ? "var(--color-green)" : "var(--color-gold)"}
                    aria-hidden
                  />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                    Selfie photo
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>
                    Clear photo of your face
                  </div>
                </div>
                {selfieReady && (
                  <CheckCircle
                    size={16}
                    color="var(--color-green)"
                    style={{ marginLeft: "auto" }}
                    aria-hidden
                  />
                )}
              </div>

              <SelfieCapture
                preview={selfiePreview}
                disabled={uploading === "selfie"}
                onCapture={(file, url) => void handleSelfieCapture(file, url)}
                onClear={clearSelfie}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "16px 20px",
            maxWidth: 580,
            margin: "0 auto 20px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--color-ink-muted)",
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            I confirm that the ID and selfie I am uploading are genuine, accurate, and belong to
            me. I understand that submitting false information may result in permanent account
            suspension. My documents will be reviewed by the Rosterly team and stored securely.
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                flexShrink: 0,
                background: agreed ? "var(--color-gold)" : "white",
                border: `1.5px solid ${agreed ? "var(--color-gold)" : "var(--color-border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                cursor: "pointer",
                padding: 0,
              }}
              aria-pressed={agreed}
              aria-label="Accept verification disclaimer"
            >
              {agreed && <CheckCircle size={12} color="white" aria-hidden />}
            </button>
            <span style={{ fontSize: 13, color: "var(--color-ink)", fontWeight: 500 }}>
              I accept the verification disclaimer
            </span>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            maxWidth: 580,
            margin: "0 auto",
          }}
        >
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-portal-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck size={14} aria-hidden />
            {isSubmitting ? "Submitting…" : "Submit for verification"}
          </button>

          {!canSubmit && !isSubmitting && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              {!idReady && !selfieReady
                ? "Upload both documents to continue"
                : !idReady
                  ? "ID document still needed"
                  : !selfieReady
                    ? "Selfie still needed"
                    : uploading
                      ? "Please wait for uploads to finish"
                      : "Accept the disclaimer to continue"}
            </p>
          )}
        </div>
        </div>
      </div>
    </form>
  );
}
