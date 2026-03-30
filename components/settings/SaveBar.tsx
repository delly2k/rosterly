"use client";

export function SaveBar({
  onSave,
  saving,
  message,
  disabled,
}: {
  onSave: () => void;
  saving: boolean;
  message?: { type: "ok" | "error"; text: string } | null;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onSave}
        disabled={disabled ?? saving}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message && (
        <p
          className={`text-sm ${message.type === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
