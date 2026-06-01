import type { LucideIcon } from "lucide-react";

export type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex w-full items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
          <Icon className="h-[18px] w-[18px] text-[var(--color-gold)]" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight text-[var(--color-ink)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
