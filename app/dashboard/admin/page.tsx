import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShieldCheck, GraduationCap } from "lucide-react";

const tools = [
  {
    href: "/dashboard/admin/verifications",
    title: "Verify users",
    description: "Approve or reject ID verification requests.",
    accent: "gold" as const,
  },
  {
    href: "/dashboard/admin/reports",
    title: "Reports & disputes",
    description: "Non-payment, harassment, unsafe environment. Resolve or dismiss.",
    accent: "warning" as const,
  },
  {
    href: "/dashboard/admin/users",
    title: "User management",
    description: "Suspend or ban users. Status enforced by middleware.",
    accent: "green" as const,
  },
  {
    href: "/dashboard/admin/audit",
    title: "Audit log",
    description: "Gig, application, booking and check-in change history.",
    accent: "gold" as const,
  },
  {
    href: "/dashboard/admin/chats",
    title: "Chats (read-only)",
    description: "View all gig chats. Flagged messages highlighted.",
    accent: "green" as const,
  },
  {
    href: "/dashboard/admin/bookings",
    title: "Bookings (dummy)",
    description: "Payment confirmed / transport assigned toggles. No real integration.",
    accent: "neutral" as const,
  },
  {
    href: "/dashboard/admin/academy",
    title: "Academy",
    description: "Manage courses, questions, and certificates",
    accent: "gold" as const,
  },
];

const accentStyles = {
  gold: "border-[var(--color-gold-border)] bg-[var(--color-gold-light)]",
  warning: "border-[rgba(217,119,6,0.3)] bg-[var(--color-warning-light)]",
  green: "border-[var(--color-green-border)] bg-[var(--color-green-light)]",
  neutral: "border-[var(--color-border)] bg-[var(--color-card)]",
};

export default async function AdminDashboardPage() {
  await requireRole(ROLES.ADMIN);

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={ShieldCheck}
        title="Admin dashboard"
        description="Trust and safety tools"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group surface-card block cursor-pointer overflow-hidden border-l-4 border-l-transparent p-5 transition-all duration-150 hover:border-l-[#C8973A] hover:bg-[#FAFAF8] hover:translate-x-[2px] ${accentStyles[tool.accent]}`}
          >
            <h2 className="admin-section-title">{tool.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {tool.description}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-[var(--color-ink-muted)] transition-transform duration-150 group-hover:translate-x-1 group-hover:text-[#C8973A]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
