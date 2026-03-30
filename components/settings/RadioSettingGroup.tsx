"use client";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export function RadioSettingGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  name: string;
  options: RadioOption<T>[];
  value: string;
  onChange: (value: T) => void;
  "aria-label"?: string;
}) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label={ariaLabel ?? name}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer gap-3 rounded-lg border border-zinc-200 p-3 has-[:checked]:border-black has-[:checked]:ring-2 has-[:checked]:ring-black/20 dark:border-zinc-700 dark:has-[:checked]:border-zinc-300"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value as T)}
            className="mt-0.5 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500"
          />
          <div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {opt.label}
            </span>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {opt.description}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}
