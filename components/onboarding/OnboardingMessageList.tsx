import { Sparkles } from "lucide-react";
import { ProfileSummaryCard } from "@/components/ui/ProfileSummaryCard";
import {
  isProfileSummaryMessage,
  parseMarkdown,
} from "@/lib/onboarding-markdown";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  messages: Message[];
  avatarSize?: number;
};

export function OnboardingMessageList({ messages, avatarSize = 26 }: Props) {
  return (
    <>
      {messages.map((msg, i) => {
        if (isProfileSummaryMessage(msg.role, msg.content)) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  background: "var(--color-gold-light)",
                  border: "1px solid var(--color-gold-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={avatarSize <= 26 ? 11 : 12} color="var(--color-gold)" />
              </div>
              <ProfileSummaryCard content={msg.content} />
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  background: "var(--color-gold-light)",
                  border: "1px solid var(--color-gold-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={avatarSize <= 26 ? 11 : 12} color="var(--color-gold)" />
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius:
                  msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: msg.role === "user" ? "var(--color-gold)" : "white",
                border: msg.role === "user" ? "none" : "0.5px solid var(--color-border)",
                color: msg.role === "user" ? "white" : "var(--color-ink)",
                fontSize: 13,
                lineHeight: 1.7,
                boxShadow:
                  msg.role === "assistant" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {msg.role === "assistant" ? (
                <span
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
