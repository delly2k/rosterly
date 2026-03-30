"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateGig } from "@/app/dashboard/merchant/gigs/actions";
import type { GigStatus } from "@/types/gig";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  duties: z.string().min(1, "Enter at least one duty"),
  spots: z.coerce.number().int().min(1, "At least 1 person needed"),
  pay_rate: z.coerce.number().min(0).nullable().optional(),
  payment_method_dummy: z.string().nullable(),
  location_general: z.string().nullable(),
  location_exact: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  status: z.enum(["draft", "open", "filled", "cancelled", "completed"]),
});

type FormData = z.infer<typeof schema>;

type Gig = {
  id: string;
  title: string;
  duties: unknown;
  spots?: number;
  pay_rate: number | null;
  payment_method_dummy: string | null;
  location_general: string | null;
  location_exact: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
};

export function EditGigForm({ gig }: { gig: Gig }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dutiesStr = Array.isArray(gig.duties)
    ? gig.duties.join("\n")
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: gig.title,
      duties: dutiesStr,
      spots: gig.spots ?? 1,
      pay_rate: gig.pay_rate ?? undefined,
      payment_method_dummy: gig.payment_method_dummy ?? "",
      location_general: gig.location_general ?? "",
      location_exact: gig.location_exact ?? "",
      start_time: gig.start_time
        ? new Date(gig.start_time).toISOString().slice(0, 16)
        : "",
      end_time: gig.end_time
        ? new Date(gig.end_time).toISOString().slice(0, 16)
        : "",
      status: gig.status as GigStatus,
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    try {
      const duties = data.duties
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await updateGig(gig.id, {
        title: data.title,
        duties,
        spots: data.spots,
        pay_rate: data.pay_rate ?? null,
        payment_method_dummy: data.payment_method_dummy || null,
        location_general: data.location_general || null,
        location_exact: data.location_exact || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        status: data.status as GigStatus,
      });
      router.push(`/dashboard/merchant/gigs/${gig.id}`);
      router.refresh();
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Could not update gig."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="duties"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Duties (one per line)
        </label>
        <textarea
          id="duties"
          rows={4}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("duties")}
        />
        {errors.duties && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.duties.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="spots"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Number of people needed
        </label>
        <input
          id="spots"
          type="number"
          min={1}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("spots")}
        />
        {errors.spots && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.spots.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="pay_rate"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Pay rate ($/hr)
          </label>
          <input
            id="pay_rate"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            {...register("pay_rate")}
          />
        </div>
        <div>
          <label
            htmlFor="payment_method_dummy"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Payment method (dummy)
          </label>
          <input
            id="payment_method_dummy"
            type="text"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            {...register("payment_method_dummy")}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="location_general"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          General location
        </label>
        <input
          id="location_general"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("location_general")}
        />
      </div>

      <div>
        <label
          htmlFor="location_exact"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Exact address (hidden until booking)
        </label>
        <input
          id="location_exact"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("location_exact")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="start_time"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Start time
          </label>
          <input
            id="start_time"
            type="datetime-local"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            {...register("start_time")}
          />
        </div>
        <div>
          <label
            htmlFor="end_time"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            End time
          </label>
          <input
            id="end_time"
            type="datetime-local"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            {...register("end_time")}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Status
        </label>
        <select
          id="status"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("status")}
        >
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="filled">Filled</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/dashboard/merchant/gigs/${gig.id}`}
          className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
