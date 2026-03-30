"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Eye, Upload } from "lucide-react";
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
    "w-full rounded-[4px] border-[3px] border-black bg-white px-3 py-2 text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:text-zinc-100";

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

  return (
    <div className="space-y-8">
      <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="section-title text-base">Responsible officers</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add authorised officers. You need at least one and all required
          profile fields filled (on your Profile page) before you can submit
          verification.
        </p>

        {/* Add officer form - inline on page */}
        <div className="mt-6 rounded-[4px] border-[3px] border-black bg-zinc-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800/50 md:p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Add responsible officer
          </h3>
          <form
            onSubmit={officerForm.handleSubmit(onAddOfficer)}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            {officerForm.formState.errors.root && (
              <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">
                {officerForm.formState.errors.root.message}
              </p>
            )}
            <div>
              <label
                htmlFor="officer-name"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {officerForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="officer-position"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
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
              <label
                htmlFor="officer-email"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {officerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="officer-phone"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Phone number
              </label>
              <input
                id="officer-phone"
                type="tel"
                className={officerInputClass}
                placeholder="+1 234 567 8900"
                {...officerForm.register("phone")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Officer ID document
              </label>
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
                className="rounded-[4px] border-[3px] border-black bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {newOfficerIdFile ? newOfficerIdFile.name : "Choose ID document (required)"}
              </button>
              {newOfficerIdFile && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Selected. Upload will happen when you click Add officer.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={officerForm.formState.isSubmitting}
                className="rounded-[4px] border-[3px] border-black bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {officerForm.formState.isSubmitting ? "Adding…" : "Add officer"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 overflow-hidden">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="w-[18%] py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </th>
                <th className="w-[14%] py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Position
                </th>
                <th className="w-[22%] py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </th>
                <th className="w-[16%] py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Phone
                </th>
                <th className="w-[14%] py-2" aria-label="ID status" />
                <th className="w-[16%] py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initialOfficers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    No officers yet. Add one to continue.
                  </td>
                </tr>
              ) : (
                initialOfficers.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-2 text-zinc-900 dark:text-zinc-100">
                      <span className="block truncate" title={o.name}>{o.name}</span>
                    </td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-400">
                      <span className="block truncate" title={o.position ?? undefined}>{o.position ?? "—"}</span>
                    </td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-400">
                      <span className="block truncate" title={o.email ?? undefined}>{o.email ?? "—"}</span>
                    </td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-400">
                      <span className="block truncate" title={o.phone ?? undefined}>{o.phone ?? "—"}</span>
                    </td>
                    <td className="py-2">
                      {!o.id_doc_url && (
                        <>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            id={`officer-id-${o.id}`}
                            onChange={(e) => onOfficerIdFileChange(e, o.id)}
                          />
                          <label
                            htmlFor={uploadingOfficerIdFor === o.id ? undefined : `officer-id-${o.id}`}
                            className={`inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 ${uploadingOfficerIdFor === o.id ? "pointer-events-none opacity-50" : ""}`}
                          >
                            <Upload className="h-4 w-4" />
                            {uploadingOfficerIdFor === o.id ? "Uploading…" : "Upload ID"}
                          </label>
                        </>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {o.id_doc_url && (
                          <button
                            type="button"
                            onClick={() => onViewId(o.id_doc_url!)}
                            className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                            title="View ID"
                            aria-label="View ID document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingOfficer(o)}
                          className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                          title="Edit officer"
                          aria-label="Edit officer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteOfficer(o.id)}
                          disabled={deleteId === o.id}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                          title="Remove officer"
                          aria-label="Remove officer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification */}
      <div className="space-y-4">
        {verificationStatus === "pending" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
            Your verification is under review. You cannot post gigs until
            approved.
          </div>
        )}
        {verificationStatus === "verified" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200">
            You are verified. You can post gigs.
          </div>
        )}

        {showVerificationBlock && (
          <>
            {rejected && (
              <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                Your previous verification was rejected. You may submit again
                with a new document once the requirements below are met.
              </div>
            )}

            {!canVerify && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Complete your{" "}
                <Link
                  href="/dashboard/merchant/profile"
                  className="font-medium text-zinc-900 underline dark:text-zinc-100"
                >
                  Profile
                </Link>{" "}
                (business name and type), add at least one responsible officer
                with an ID document uploaded above, then you can submit
                verification.
              </p>
            )}

            {verifyError && (
              <div
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
                role="alert"
              >
                {verifyError}
              </div>
            )}

            <button
              type="button"
              onClick={onVerificationSubmit}
              disabled={!canVerify}
              className="rounded-[4px] border-[3px] border-black bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 disabled:opacity-50 disabled:shadow-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Submit verification
            </button>
          </>
        )}
      </div>

      {/* Edit officer modal */}
      {editingOfficer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-officer-title"
        >
          <div className="w-full max-w-md rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
            <h3 id="edit-officer-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Edit officer
            </h3>
            <form
              onSubmit={editForm.handleSubmit(onSaveEdit)}
              className="mt-4 space-y-4"
            >
              {editForm.formState.errors.root && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {editForm.formState.errors.root.message}
                </p>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  className={officerInputClass}
                  {...editForm.register("name")}
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Position</label>
                <input
                  type="text"
                  placeholder="e.g. Director, Manager"
                  className={officerInputClass}
                  {...editForm.register("position")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input type="email" className={officerInputClass} {...editForm.register("email")} />
                {editForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone number</label>
                <input type="tel" className={officerInputClass} {...editForm.register("phone")} />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="rounded-[4px] border-[3px] border-black bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {editForm.formState.isSubmitting ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="rounded-[4px] border-[3px] border-black bg-white px-4 py-2 text-sm font-bold text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
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
