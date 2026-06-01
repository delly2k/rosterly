"use client";

import { useRouter } from "next/navigation";
import MobileHeader from "../MobileHeader";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  /** Extra bottom space for sticky footers (e.g. apply bar) above tab bar */
  footer?: React.ReactNode;
  contentStyle?: React.CSSProperties;
};

export default function MobileParticipantShell({
  title,
  showBack,
  onBack,
  children,
  footer,
  contentStyle,
}: Props) {
  const router = useRouter();

  return (
    <div
      style={{
        background: "var(--color-page)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MobileHeader
        title={title}
        showBack={showBack}
        onBack={onBack ?? (() => router.back())}
      />
      <div
        style={{
          flex: 1,
          padding: `12px ${16}px 16px`,
          paddingBottom: footer ? 100 : 16,
          ...contentStyle,
        }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
