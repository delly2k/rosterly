"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Check, MapPin } from "lucide-react";
import AddressMap from "@/components/ui/AddressMap";
import { PARISHES } from "@/lib/constants/parishes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createGig } from "@/app/dashboard/merchant/gigs/actions";
import type { GigStatus } from "@/types/gig";
import {
  LegalAcknowledgmentModal,
  LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE,
} from "@/components/legal/LegalAcknowledgmentModal";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { PLAN_LIMIT_REACHED } from "@/lib/billing/planLimitCodes";

const PAYMENT_METHODS = [
  "Cash",
  "Bank transfer",
  "NCB Pay",
  "Lynk",
  "Bill Express",
  "Cheque",
  "PayPal",
  "Crypto",
];

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--color-ink)",
  marginBottom: 6,
  display: "block",
} as const;

const helperStyle = {
  fontSize: 11,
  color: "var(--color-ink-hint)",
  marginTop: 4,
} as const;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  spots: z.coerce.number().int().min(1, "At least 1 person needed"),
  pay_rate: z.coerce.number().min(0).nullable().optional(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  status: z.enum(["draft", "open"]),
});

type FormData = z.infer<typeof schema>;

export function CreateGigForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [duties, setDuties] = useState<string[]>([]);
  const [dutyInput, setDutyInput] = useState("");
  const [dutiesError, setDutiesError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [locationStreet, setLocationStreet] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationParish, setLocationParish] = useState("");
  const [debouncedMapQuery, setDebouncedMapQuery] = useState("");

  const togglePayment = (method: string) => {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-payment-dropdown]")) {
        setPaymentOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = [locationStreet, locationCity, locationParish, "Jamaica"]
        .filter(Boolean)
        .join(", ");
      if (q.replace(/,\s*Jamaica/, "").trim().length > 5) {
        setDebouncedMapQuery(q);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [locationStreet, locationCity, locationParish]);

  const addDuty = () => {
    const trimmed = dutyInput.trim();
    if (trimmed && !duties.includes(trimmed)) {
      setDuties([...duties, trimmed]);
      setDutyInput("");
      setDutiesError(null);
    }
  };

  const removeDuty = (index: number) => {
    setDuties(duties.filter((_, i) => i !== index));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      spots: 1,
      pay_rate: undefined,
      start_time: "",
      end_time: "",
      status: "draft",
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    if (duties.length === 0) {
      setDutiesError("Enter at least one duty");
      return;
    }
    setDutiesError(null);
    try {
      const id = await createGig({
        title: data.title,
        duties,
        spots: data.spots,
        pay_rate: data.pay_rate ?? null,
        payment_method_dummy:
          selectedPayments.length > 0 ? JSON.stringify(selectedPayments) : null,
        location_street: locationStreet || null,
        location_city: locationCity || null,
        location_parish: locationParish || null,
        location_general: [locationCity, locationParish].filter(Boolean).join(", ") || null,
        location_exact:
          [locationStreet, locationCity, locationParish, "Jamaica"]
            .filter(Boolean)
            .join(", ") || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        status: data.status as GigStatus,
      });
      router.push(`/dashboard/merchant/gigs/${id}`);
      router.refresh();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not create gig. Please try again.";
      if (msg === LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE) {
        setShowLegalModal(true);
      } else if (msg === PLAN_LIMIT_REACHED) {
        setShowUpgradeModal(true);
      } else {
        setSubmitError(msg);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <LegalAcknowledgmentModal
        open={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />
      <UpgradePlanModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderRadius: "12px",
          padding: "32px",
        }}
      >
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
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="spots"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Number of people
            </label>
            <input
              id="spots"
              type="number"
              min={1}
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("spots")}
            />
            {errors.spots && (
              <p className="mt-1 text-sm text-red-600">{errors.spots.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="pay_rate"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Pay rate (J$/hr)
            </label>
            <input
              id="pay_rate"
              type="number"
              step="0.01"
              min="0"
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("pay_rate")}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink)",
                marginBottom: 6,
                display: "block",
              }}
            >
              Duties
            </label>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                className="input-refined"
                placeholder="e.g. Distribute product samples to customers"
                value={dutyInput}
                onChange={(e) => setDutyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDuty();
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={addDuty}
                style={{
                  background: "var(--color-gold)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "0 18px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                + Add
              </button>
            </div>

            {duties.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "#FAFAF8",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "12px",
                }}
              >
                {duties.map((duty, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "white",
                      border: "0.5px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 13,
                      color: "var(--color-ink)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "var(--color-gold-light)",
                          border: "0.5px solid var(--color-gold-border)",
                          color: "var(--color-gold)",
                          fontSize: 10,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      {duty}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDuty(i)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-ink-hint)",
                        cursor: "pointer",
                        padding: "2px 4px",
                        borderRadius: 4,
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-danger)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--color-ink-hint)";
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {duties.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-hint)",
                  fontStyle: "italic",
                }}
              >
                No duties added yet. Press Enter or click Add.
              </div>
            )}

            {dutiesError && (
              <p className="mt-1 text-sm text-red-600">{dutiesError}</p>
            )}

            <input type="hidden" name="duties" value={JSON.stringify(duties)} />
          </div>

          <div>
            <label style={labelStyle}>General area</label>
            <input
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              placeholder="e.g. New Kingston, Half Way Tree"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
            />
            <div style={helperStyle}>Shown to applicants before booking</div>
          </div>

          <div>
            <label style={labelStyle}>Parish</label>
            <select
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              value={locationParish}
              onChange={(e) => setLocationParish(e.target.value)}
            >
              <option value="">Select parish</option>
              {PARISHES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Exact street address</label>
            <input
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              placeholder="e.g. 1b Slipdock Road"
              value={locationStreet}
              onChange={(e) => setLocationStreet(e.target.value)}
            />
            <div style={helperStyle}>
              Only revealed to participants after booking is confirmed
            </div>
          </div>

          {debouncedMapQuery && (
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
                Gig location preview
              </div>
              <AddressMap query={debouncedMapQuery} />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-hint)",
                  marginTop: 6,
                }}
              >
                Exact address is hidden from applicants until they are booked
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="start_time"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Start time
            </label>
            <input
              id="start_time"
              type="datetime-local"
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("start_time")}
            />
          </div>

          <div>
            <label
              htmlFor="end_time"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              End time
            </label>
            <input
              id="end_time"
              type="datetime-local"
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("end_time")}
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
            >
              Status
            </label>
            <select
              id="status"
              className="input-refined w-full text-sm text-[var(--color-ink)]"
              {...register("status")}
            >
              <option value="draft">Draft (not visible to participants)</option>
              <option value="open">Open (accept applications)</option>
            </select>
          </div>

          <div style={{ position: "relative" }} data-payment-dropdown>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink)",
                marginBottom: 6,
                display: "block",
              }}
            >
              Payment method
            </label>

            <button
              type="button"
              onClick={() => setPaymentOpen(!paymentOpen)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 13,
                color:
                  selectedPayments.length > 0
                    ? "var(--color-ink)"
                    : "var(--color-ink-hint)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>
                {selectedPayments.length === 0
                  ? "Select payment methods"
                  : selectedPayments.join(", ")}
              </span>
              <ChevronDown
                size={15}
                style={{
                  color: "var(--color-ink-muted)",
                  transform: paymentOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
            </button>

            {paymentOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method}
                    onClick={() => togglePayment(method)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--color-ink)",
                      background: selectedPayments.includes(method)
                        ? "var(--color-gold-light)"
                        : "white",
                      borderBottom: "0.5px solid var(--color-border)",
                      transition: "background 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedPayments.includes(method)) {
                        e.currentTarget.style.background = "#FAFAF8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedPayments.includes(method)) {
                        e.currentTarget.style.background = "white";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: selectedPayments.includes(method)
                          ? "1.5px solid var(--color-gold)"
                          : "1.5px solid var(--color-border)",
                        background: selectedPayments.includes(method)
                          ? "var(--color-gold)"
                          : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.1s ease",
                      }}
                    >
                      {selectedPayments.includes(method) && (
                        <Check size={10} color="white" strokeWidth={3} />
                      )}
                    </div>
                    {method}
                  </div>
                ))}
              </div>
            )}

            {selectedPayments.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {selectedPayments.map((method) => (
                  <div
                    key={method}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "var(--color-gold-light)",
                      border: "0.5px solid var(--color-gold-border)",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--color-gold)",
                    }}
                  >
                    {method}
                    <span
                      onClick={() => togglePayment(method)}
                      style={{
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                        marginLeft: 2,
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}

            <input
              type="hidden"
              name="payment_method_dummy"
              value={JSON.stringify(selectedPayments)}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "8px",
              borderTop: "0.5px solid var(--color-border)",
              marginTop: "8px",
            }}
          >
            <Link
              href="/dashboard/merchant/gigs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 16px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "white",
                color: "var(--color-ink)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                background: "var(--color-gold)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Creating…" : "Create gig"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
