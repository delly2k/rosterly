"use client";

const cardBase =
  "rounded-[4px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

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
    <section className={`${cardBase} ${className ?? ""}`}>
      <h2 className="text-xl font-bold leading-tight text-black md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-black/80 leading-relaxed">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}
