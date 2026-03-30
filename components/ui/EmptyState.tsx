import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[4px] border-[3px] border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[4px] border-[3px] border-black bg-[#F3F4F6]">
        <Icon className="h-8 w-8 stroke-[3] text-black" strokeWidth={3} />
      </div>
      <h2 className="section-title mt-4">{title}</h2>
      <p className="mt-2 text-sm text-black/80">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
