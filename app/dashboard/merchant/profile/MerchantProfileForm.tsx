"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import AddressMap from "@/components/ui/AddressMap";
import { PARISHES } from "@/lib/constants/parishes";
import { upsertMerchantProfile } from "@/app/dashboard/merchant/actions";

const PAYMENT_OPTIONS = [
  { value: "", label: "Select payment method" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
] as const;

const BUSINESS_TYPES = [
  "Sole Trader",
  "Partnership",
  "Limited Liability Company",
  "Public Limited Company",
  "NGO / Non-profit",
  "Government Agency",
  "Other",
];

const profileSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_type: z.string().min(1, "Business type is required"),
  trn: z.string(),
  payment_method: z.string(),
  accept_disclaimer: z
    .boolean()
    .refine((v) => v === true, {
      message: "You must accept the merchant disclaimer.",
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const MERCHANT_DISCLAIMER =
  "I confirm that the business and officer details I provide are accurate. I am authorised to represent this business. I understand that false information may result in account suspension.";

type MerchantProfileFormProps = {
  initial: {
    business_name: string | null;
    business_type: string | null;
    address: string | null;
    street_address?: string | null;
    city?: string | null;
    parish?: string | null;
    postal_code?: string | null;
    trn: string | null;
    payment_method: string | null;
    disclaimer_accepted_at: string | null;
  } | null;
};

function legacyStreetAddress(initial: MerchantProfileFormProps["initial"]): string {
  if (initial?.street_address?.trim()) return initial.street_address;
  if (initial?.address?.trim()) return initial.address;
  return "";
}

export function MerchantProfileForm({ initial }: MerchantProfileFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [streetAddress, setStreetAddress] = useState(() => legacyStreetAddress(initial));
  const [city, setCity] = useState(initial?.city ?? "");
  const [parish, setParish] = useState(initial?.parish ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postal_code ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: initial?.business_name ?? "",
      business_type: initial?.business_type ?? "",
      trn: initial?.trn ?? "",
      payment_method: initial?.payment_method ?? "",
      accept_disclaimer: !!initial?.disclaimer_accepted_at,
    },
  });

  useEffect(() => {
    profileForm.reset({
      business_name: initial?.business_name ?? "",
      business_type: initial?.business_type ?? "",
      trn: initial?.trn ?? "",
      payment_method: initial?.payment_method ?? "",
      accept_disclaimer: !!initial?.disclaimer_accepted_at,
    });
    setStreetAddress(legacyStreetAddress(initial));
    setCity(initial?.city ?? "");
    setParish(initial?.parish ?? "");
    setPostalCode(initial?.postal_code ?? "");
  }, [
    initial?.business_name,
    initial?.business_type,
    initial?.address,
    initial?.street_address,
    initial?.city,
    initial?.parish,
    initial?.postal_code,
    initial?.trn,
    initial?.payment_method,
    initial?.disclaimer_accepted_at,
    profileForm.reset,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = [streetAddress, city, parish, "Jamaica"].filter(Boolean).join(", ");
      if (q.replace(/,\s*Jamaica/, "").trim().length > 5) {
        setDebouncedQuery(q);
      } else {
        setDebouncedQuery("");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [streetAddress, city, parish]);

  async function onProfileSubmit(data: ProfileFormData) {
    setSubmitError(null);
    setSaveSuccess(false);
    const combinedAddress = [streetAddress, city, parish, "Jamaica"].filter(Boolean).join(", ");
    try {
      await upsertMerchantProfile({
        business_name: data.business_name,
        business_type: data.business_type,
        street_address: streetAddress || null,
        city: city || null,
        parish: parish || null,
        postal_code: postalCode || null,
        address: combinedAddress || null,
        trn: data.trn || null,
        payment_method: data.payment_method || null,
        accept_disclaimer: data.accept_disclaimer,
      });
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch {
      setSubmitError("Could not save profile. Please try again.");
    }
  }

  const inputClass = "input-refined w-full px-3 py-2 text-sm text-[var(--color-ink)]";
  const selectClass = "input-refined w-full text-sm text-[var(--color-ink)]";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--color-ink-muted)]";

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        padding: 32,
      }}
    >
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        {saveSuccess && (
          <div
            style={{
              background: "var(--color-gold)",
              color: "white",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: 20,
            }}
            role="status"
          >
            Profile saved.
          </div>
        )}
        {submitError && (
          <div
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
            style={{ marginBottom: 20 }}
          >
            {submitError}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <div>
            <label htmlFor="business_name" className={labelClass}>
              Business name
            </label>
            <input
              id="business_name"
              type="text"
              className={inputClass}
              {...profileForm.register("business_name")}
            />
            {profileForm.formState.errors.business_name && (
              <p className="mt-1 text-sm text-red-600">
                {profileForm.formState.errors.business_name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="business_type" className={labelClass}>
              Business type
            </label>
            <select
              id="business_type"
              className={selectClass}
              {...profileForm.register("business_type")}
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {profileForm.formState.errors.business_type && (
              <p className="mt-1 text-sm text-red-600">
                {profileForm.formState.errors.business_type.message}
              </p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="trn" className={labelClass}>
              TRn (Tax reference number)
            </label>
            <input
              id="trn"
              type="text"
              className={inputClass}
              {...profileForm.register("trn")}
            />
          </div>

          <div>
            <label htmlFor="street_address" className={labelClass}>
              Street address
            </label>
            <input
              id="street_address"
              type="text"
              className={inputClass}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>
              City / Town
            </label>
            <input
              id="city"
              type="text"
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="parish" className={labelClass}>
              Parish
            </label>
            <select
              id="parish"
              className={selectClass}
              value={parish}
              onChange={(e) => setParish(e.target.value)}
            >
              <option value="">Select parish</option>
              {PARISHES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="postal_code" className={labelClass}>
              Postal code (optional)
            </label>
            <input
              id="postal_code"
              type="text"
              className={inputClass}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          {debouncedQuery && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MapPin size={13} color="var(--color-gold)" />
                Location preview
              </div>
              <AddressMap query={debouncedQuery} />
              <div
                style={{ fontSize: 11, color: "var(--color-ink-hint)", marginTop: 6 }}
              >
                Showing: {debouncedQuery}
              </div>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="payment_method" className={labelClass}>
              Payment method
            </label>
            <select
              id="payment_method"
              className={selectClass}
              {...profileForm.register("payment_method")}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{ gridColumn: "1 / -1" }}
            className="rounded-md border border-[#E5E3DC] bg-zinc-50 p-4"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">{MERCHANT_DISCLAIMER}</p>
            <label className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#E5E3DC] text-[var(--color-ink)] focus:ring-zinc-500"
                {...profileForm.register("accept_disclaimer")}
              />
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                I accept the merchant disclaimer
              </span>
            </label>
            {profileForm.formState.errors.accept_disclaimer && (
              <p className="mt-1 text-sm text-red-600">
                {profileForm.formState.errors.accept_disclaimer.message}
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
              disabled={profileForm.formState.isSubmitting}
              className="btn-portal-primary"
            >
              {profileForm.formState.isSubmitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
