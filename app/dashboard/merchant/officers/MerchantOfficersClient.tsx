"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Eye, Upload, UserPlus, Users, Phone, ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import {
  merchantOfficerIdDocPath,
  VERIFICATION_DOCS_BUCKET,
} from "@/lib/storage";
import {
  submitMerchantVerification,
  addMerchantOfficer,
  deleteMerchantOfficer,
  updateMerchantOfficerIdDoc,
  updateMerchantOfficer,
  getOfficerIdDocSignedUrl,
} from "@/app/dashboard/merchant/actions";
import type { MerchantResponsibleOfficer } from "@/types/merchant";

const officerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string(),
  email: z.string().email("Valid email required").or(z.literal("")),
  phone: z.string(),
});

type OfficerFormData = z.infer<typeof officerSchema>;

type MerchantOfficersClientProps = {
  profile: { business_name: string | null; business_type: string | null } | null;
  officers: MerchantResponsibleOfficer[];
  verificationStatus: "unverified" | "pending" | "verified";
  latestVerificationStatus?: string | null;
};

export function MerchantOfficersClient({
  profile,
  officers: initialOfficers,
  verificationStatus,
  latestVerificationStatus,
}: MerchantOfficersClientProps) {
  const router = useRouter();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newOfficerIdFile, setNewOfficerIdFile] = useState<File | null>(null);
  const [uploadingOfficerIdFor, setUploadingOfficerIdFor] = useState<string | null>(null);
  const officerIdFileInputRef = useRef<HTMLInputElement>(null);
  const [editingOfficer, setEditingOfficer] = useState<MerchantResponsibleOfficer | null>(null);

  const officerForm = useForm<OfficerFormData>({
    resolver: zodResolver(officerSchema),
    defaultValues: { name: "", position: "", email: "", phone: "" },
  });

  const editForm = useForm<OfficerFormData>({
    resolver: zodResolver(officerSchema),
    defaultValues: { name: "", position: "", email: "", phone: "" },
  });

  const officerInputClass =
    "input-refined w-full text-sm text-[var(--color-ink)]";

  const hasRequiredProfileFields = Boolean(
    profile?.business_name?.trim() && profile?.business_type?.trim()
  );
  const hasAtLeastOneOfficer = initialOfficers.length >= 1;
  const atLeastOneOfficerHasIdDoc = initialOfficers.some((o) => o.id_doc_url);
  const rejected = latestVerificationStatus === "rejected";
  const canVerify =
    hasRequiredProfileFields &&
    hasAtLeastOneOfficer &&
    atLeastOneOfficerHasIdDoc &&
    (verificationStatus === "unverified" || rejected);
  const showVerificationBlock = verificationStatus === "unverified" || rejected;
  const firstOfficerWithIdDoc = initialOfficers.find((o) => o.id_doc_url);

  useEffect(() => {
    if (editingOfficer) {
      editForm.reset({
        name: editingOfficer.name,
        position: editingOfficer.position ?? "",
        email: editingOfficer.email ?? "",
        phone: editingOfficer.phone ?? "",
      });
    }
  }, [editingOfficer]);

  async function onAddOfficer(data: OfficerFormData) {
    if (!newOfficerIdFile) {
      officerForm.setError("root", { message: "Please upload an ID document for the officer." });
      return;
    }
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const ext = newOfficerIdFile.name.split(".").pop() || "pdf";
      const filename = `${Date.now()}.${ext}`;
      const path = merchantOfficerIdDocPath(user.id, filename);
      const { error: uploadError } = await supabase.storage
        .from(VERIFICATION_DOCS_BUCKET)
        .upload(path, newOfficerIdFile, { upsert: true });
      if (uploadError) {
        officerForm.setError("root", { message: "Could not upload ID document. Try again." });
        return;
      }
      await addMerchantOfficer({
        name: data.name,
        position: data.position || null,
        email: data.email || null,
        phone: data.phone || null,
        id_doc_url: path,
      });
      officerForm.reset({ name: "", position: "", email: "", phone: "" });
      setNewOfficerIdFile(null);
      if (officerIdFileInputRef.current) officerIdFileInputRef.current.value = "";
      router.refresh();
    } catch {
      officerForm.setError("root", { message: "Could not add officer." });
    }
  }

  async function onViewId(path: string) {
    try {
      const url = await getOfficerIdDocSignedUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setVerifyError("Could not open document.");
    }
  }

  async function onOfficerIdFileChange(e: React.ChangeEvent<HTMLInputElement>, forOfficerId: string | null) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (forOfficerId) {
      setUploadingOfficerIdFor(forOfficerId);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const ext = file.name.split(".").pop() || "pdf";
        const filename = `${forOfficerId}-${Date.now()}.${ext}`;
        const path = merchantOfficerIdDocPath(user.id, filename);
        const { error } = await supabase.storage
          .from(VERIFICATION_DOCS_BUCKET)
          .upload(path, file, { upsert: true });
        if (error) return;
        await updateMerchantOfficerIdDoc(forOfficerId, path);
        router.refresh();
      } finally {
        setUploadingOfficerIdFor(null);
        e.target.value = "";
      }
    } else {
      setNewOfficerIdFile(file);
    }
  }

  async function onDeleteOfficer(id: string) {
    if (deleteId) return;
    setDeleteId(id);
    try {
      await deleteMerchantOfficer(id);
      router.refresh();
    } catch {
      // ignore
    }
    setDeleteId(null);
  }

  async function onVerificationSubmit() {
    setVerifyError(null);
    if (!firstOfficerWithIdDoc?.id_doc_url) return;
    try {
      await submitMerchantVerification(firstOfficerWithIdDoc.id_doc_url);
      router.refresh();
    } catch {
      setVerifyError("Could not submit verification. Please try again.");
    }
  }

  async function onSaveEdit(data: OfficerFormData) {
    if (!editingOfficer) return;
    try {
      await updateMerchantOfficer(editingOfficer.id, {
        name: data.name,
        position: data.position || null,
        email: data.email || null,
        phone: data.phone || null,
      });
      setEditingOfficer(null);
      router.refresh();
    } catch {
      editForm.setError("root", { message: "Could not update officer." });
    }
  }

  const officerLabelClass = "mb-1 block text-sm font-medium text-[var(--color-ink-muted)]";
  const isVerified = verificationStatus === "verified";

  return (
    <div className="space-y-6">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--color-gold-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={15} color="var(--color-gold)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                Add responsible officer
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                At least one officer required for verification
              </div>
            </div>
          </div>

          <form onSubmit={officerForm.handleSubmit(onAddOfficer)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {officerForm.formState.errors.root && (
                <p className="text-sm text-red-600" style={{ gridColumn: "1 / -1" }}>
                  {officerForm.formState.errors.root.message}
                </p>
              )}
              <div>
                <label htmlFor="officer-name" className={officerLabelClass}>
                  Name
                </label>
                <input
                  id="officer-name"
                  type="text"
                  className={officerInputClass}
                  placeholder="Full name"
                  {...officerForm.register("name")}
                />
                {officerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {officerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="officer-position" className={officerLabelClass}>
                  Position
                </label>
                <input
                  id="officer-position"
                  type="text"
                  placeholder="e.g. Director, Manager"
                  className={officerInputClass}
                  {...officerForm.register("position")}
                />
              </div>
              <div>
                <label htmlFor="officer-email" className={officerLabelClass}>
                  Email
                </label>
                <input
                  id="officer-email"
                  type="email"
                  className={officerInputClass}
                  placeholder="email@example.com"
                  {...officerForm.register("email")}
                />
                {officerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {officerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="officer-phone" className={officerLabelClass}>
                  Phone number
                </label>
                <input
                  id="officer-phone"
                  type="tel"
                  className={officerInputClass}
                  placeholder="+1 876 555 0100"
                  {...officerForm.register("phone")}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className={officerLabelClass}>Officer ID document</label>
                <input
                  ref={officerIdFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => onOfficerIdFileChange(e, null)}
                />
                <button
                  type="button"
                  onClick={() => officerIdFileInputRef.current?.click()}
                  className="input-refined w-full px-3 py-2 text-left text-sm text-[var(--color-ink)]"
                >
                  {newOfficerIdFile ? newOfficerIdFile.name : "Choose ID document (required)"}
                </button>
                {newOfficerIdFile && (
                  <p className="mt-1 text-xs text-[var(--color-ink-hint)]">
                    Selected. Upload will happen when you click Add officer.
                  </p>
                )}
              </div>
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  disabled={officerForm.formState.isSubmitting}
                  className="btn-portal-primary text-sm disabled:opacity-50"
                >
                  {officerForm.formState.isSubmitting ? "Adding…" : "Add officer"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--color-gold-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={15} color="var(--color-gold)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                Officers ({initialOfficers.length})
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                Authorised representatives of your business
              </div>
            </div>
          </div>

          {initialOfficers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--color-ink-muted)",
                fontSize: 13,
              }}
            >
              No officers added yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {initialOfficers.map((officer) => (
                <div
                  key={officer.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "#FAFAF8",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--color-gold-light)",
                      border: "1px solid var(--color-gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-gold)",
                      flexShrink: 0,
                    }}
                  >
                    {officer.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                      {officer.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                        marginTop: 2,
                      }}
                    >
                      {officer.position || "—"} · {officer.email || "—"}
                    </div>
                    {!officer.id_doc_url && (
                      <>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          id={`officer-id-${officer.id}`}
                          onChange={(e) => onOfficerIdFileChange(e, officer.id)}
                        />
                        <label
                          htmlFor={
                            uploadingOfficerIdFor === officer.id
                              ? undefined
                              : `officer-id-${officer.id}`
                          }
                          className={`mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[var(--color-gold)] underline ${
                            uploadingOfficerIdFor === officer.id
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          <Upload size={11} />
                          {uploadingOfficerIdFor === officer.id
                            ? "Uploading…"
                            : "Upload ID document"}
                        </label>
                      </>
                    )}
                  </div>

                  {officer.phone && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={11} /> {officer.phone}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {officer.id_doc_url && (
                      <button
                        type="button"
                        title="View ID"
                        onClick={() => onViewId(officer.id_doc_url!)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          border: "0.5px solid var(--color-border)",
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <Eye size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => setEditingOfficer(officer)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        border: "0.5px solid var(--color-border)",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDeleteOfficer(officer.id)}
                      disabled={deleteId === officer.id}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        border: "0.5px solid rgba(220,38,38,0.2)",
                        background: "var(--color-danger-light)",
                        cursor: deleteId === officer.id ? "not-allowed" : "pointer",
                        opacity: deleteId === officer.id ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-danger)",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          borderRadius: 12,
          background: isVerified ? "var(--color-green-light)" : "var(--color-warning-light)",
          border: `0.5px solid ${
            isVerified ? "var(--color-green-border)" : "rgba(217,119,6,0.3)"
          }`,
        }}
      >
        {isVerified ? (
          <ShieldCheck size={20} color="var(--color-green)" />
        ) : (
          <ShieldAlert size={20} color="var(--color-warning)" />
        )}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isVerified ? "var(--color-green)" : "var(--color-warning)",
            }}
          >
            {isVerified
              ? "Verified — you can post gigs"
              : verificationStatus === "pending"
                ? "Verification under review"
                : "Verification pending or incomplete"}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
            {isVerified
              ? "Your business has been verified by the Rosterly team."
              : verificationStatus === "pending"
                ? "Your verification is under review. You cannot post gigs until approved."
                : "Add at least one officer and complete your business profile to submit for verification."}
          </div>
        </div>
      </div>

      {showVerificationBlock && (
        <div className="space-y-4">
          {rejected && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Your previous verification was rejected. You may submit again with a new
              document once the requirements below are met.
            </div>
          )}

          {!canVerify && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Complete your{" "}
              <Link
                href="/dashboard/merchant/profile"
                className="font-medium text-[var(--color-ink)] underline"
              >
                Profile
              </Link>{" "}
              (business name and type), add at least one responsible officer with an ID
              document uploaded above, then you can submit verification.
            </p>
          )}

          {verifyError && (
            <div
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {verifyError}
            </div>
          )}

          <button
            type="button"
            onClick={onVerificationSubmit}
            disabled={!canVerify}
            className="btn-portal-primary text-sm disabled:opacity-50 disabled:shadow-none"
          >
            Submit verification
          </button>
        </div>
      )}

      {/* Edit officer modal */}
      {editingOfficer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-officer-title"
        >
          <div className="w-full max-w-md surface-card p-6">
            <h3 id="edit-officer-title" className="text-lg font-semibold text-[var(--color-ink)]">
              Edit officer
            </h3>
            <form
              onSubmit={editForm.handleSubmit(onSaveEdit)}
              className="mt-4 space-y-4"
            >
              {editForm.formState.errors.root && (
                <p className="text-sm text-red-600">
                  {editForm.formState.errors.root.message}
                </p>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]">Name</label>
                <input
                  type="text"
                  className={officerInputClass}
                  {...editForm.register("name")}
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]">Position</label>
                <input
                  type="text"
                  placeholder="e.g. Director, Manager"
                  className={officerInputClass}
                  {...editForm.register("position")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]">Email</label>
                <input type="email" className={officerInputClass} {...editForm.register("email")} />
                {editForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]">Phone number</label>
                <input type="tel" className={officerInputClass} {...editForm.register("phone")} />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="btn-portal-primary text-sm disabled:opacity-50"
                >
                  {editForm.formState.isSubmitting ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="rounded-[4px] bg-white px-4 py-2 text-sm font-bold text-[var(--color-ink)] hover:bg-zinc-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
