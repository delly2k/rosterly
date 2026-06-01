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
        className="btn-settings-save"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message && (
        <p
          className={`text-sm ${message.type === "ok" ? "text-[var(--color-green)]" : "text-[var(--color-danger)]"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
