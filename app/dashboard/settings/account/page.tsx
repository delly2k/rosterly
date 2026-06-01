import Link from "next/link";
import { User, ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient, getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";
import { AccountActions } from "./AccountActions";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { DeleteAccountSection } from "./DeleteAccountSection";

function formatRoleLabel(role: string): string {
  switch (role) {
    case ROLES.PARTICIPANT:
      return "Participant";
    case ROLES.MERCHANT:
      return "Merchant";
    case ROLES.ADMIN:
      return "Admin";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function verificationHref(role: string): string {
  if (role === ROLES.MERCHANT) return "/dashboard/merchant/verification";
  return "/dashboard/participant/verification";
}

async function getIsVerified(userId: string, role: string): Promise<boolean> {
  const supabase = await createClient();
  if (role === ROLES.PARTICIPANT) {
    const { data } = await supabase
      .from("participant_profiles")
      .select("verified")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.verified ?? false;
  }
  if (role === ROLES.MERCHANT) {
    const { data } = await supabase
      .from("merchant_profiles")
      .select("verified")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.verified ?? false;
  }
  return false;
}

export default async function SettingsAccountPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;
  const email = current.user.email ?? "";
  const createdAt = current.profile.created_at;
  const [isVerified] = await Promise.all([getIsVerified(current.user.id, role)]);
  const roleLabel = formatRoleLabel(role);
  const showVerificationLink = !isVerified && role !== ROLES.ADMIN;

  return (
    <SettingsPageShell
      title="Account"
      subtitle="Email, password, and account actions."
    >
      <SettingsSectionCard
        title="Account details"
        description="Your sign-in and role information."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            padding: "24px",
            margin: "-24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: 6,
                }}
              >
                Email
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                {email || "—"}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-hint)", marginTop: 3 }}>
                Read-only. Contact support to change.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: 6,
                }}
              >
                Role
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "var(--color-gold-light)",
                  border: "0.5px solid var(--color-gold-border)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-gold)",
                }}
              >
                <User size={11} />
                {roleLabel}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: 6,
                }}
              >
                Verification
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: isVerified ? "var(--color-green-light)" : "var(--color-warning-light)",
                  border: `0.5px solid ${isVerified ? "var(--color-green-border)" : "rgba(217,119,6,0.3)"}`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: isVerified ? "var(--color-green)" : "var(--color-warning)",
                }}
              >
                {isVerified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                {isVerified ? "Verified" : "Not verified"}
              </div>
              {showVerificationLink && (
                <div style={{ marginTop: 8 }}>
                  <Link
                    href={verificationHref(role)}
                    style={{
                      fontSize: 12,
                      color: "var(--color-gold)",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Complete verification →
                  </Link>
                </div>
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: 6,
                }}
              >
                Member since
              </div>
              <div style={{ fontSize: 14, color: "var(--color-ink)" }}>
                {new Date(createdAt).toLocaleDateString("en-JM", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Password"
        description="Choose a strong password you do not use elsewhere."
      >
        <PasswordChangeForm />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Actions"
        description="Sign out of your account on this device."
      >
        <AccountActions />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Delete account"
        description="Permanently remove your account and sign-in access."
        className="border-[var(--color-danger)]"
      >
        <DeleteAccountSection email={email} />
      </SettingsSectionCard>
    </SettingsPageShell>
  );
}
