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
    <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="min-w-0 flex-1">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 ${
          checked ? "bg-[#84CC16]" : "bg-zinc-200 dark:bg-zinc-600"
        }`}
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
