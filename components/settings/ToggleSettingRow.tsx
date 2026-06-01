"use client";

export function ToggleSettingRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--color-border)] p-3">
      <div className="min-w-0 flex-1">
        <span className="font-medium text-[var(--color-ink)]">{label}</span>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        data-checked={checked}
        className={`settings-toggle relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 disabled:opacity-50`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
