"use client";

export function SettingsSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card p-4 sm:p-6 ${className ?? ""}`}>
      <h2 className="text-xl font-semibold leading-tight text-[var(--color-ink)] md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}
