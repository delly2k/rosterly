"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles, Send, CheckCircle, X } from "lucide-react";
import { saveOnboardingProfile } from "@/app/dashboard/participant/onboarding/actions";
import { OnboardingMessageList } from "@/components/onboarding/OnboardingMessageList";

type Message = { role: "user" | "assistant"; content: string };

type ProfileData = {
  full_name: string;
  location_general: string;
  bio: string;
  skills: string[];
  availability: Record<string, { available: boolean; from: string; to: string }>;
  rate: number;
  suggested_certification?: string;
};

type ChatApiResponse = {
  content?: string;
  profileData?: ProfileData;
  error?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

async function parseChatResponse(res: Response): Promise<ChatApiResponse> {
  const text = await res.text();
  if (!text.trim()) {
    return { error: "Empty response from server" };
  }
  try {
    return JSON.parse(text) as ChatApiResponse;
  } catch {
    return { error: "Invalid response from server" };
  }
}

export default function OnboardingDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, profileData]);

  const sendMessage = useCallback(async (userText: string | null) => {
    setInput("");
    setLoading(true);

    try {
      const apiMessages: Message[] = userText
        ? [...messagesRef.current, { role: "user", content: userText }]
        : [{ role: "user", content: "Hi Ros, I want to complete or update my Rosterly profile." }];

      if (userText) {
        setMessages(apiMessages);
      }

      const res = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await parseChatResponse(res);

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ?? "Something went wrong. Please try again in a moment.",
          },
        ]);
        return;
      }

      const rawContent = typeof data.content === "string" ? data.content : "";
      const displayText = rawContent
        .replace(/<PROFILE_DATA>[\s\S]*?<\/PROFILE_DATA>/g, "")
        .trim();

      if (!displayText) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Please try again in a moment.",
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: displayText }]);

      if (data.profileData) {
        setProfileData(data.profileData);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      void sendMessage(null);
    }
  }, [open, started, sendMessage]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    void sendMessage(input.trim());
  };

  const handleSave = async () => {
    if (!profileData) return;
    setSaving(true);
    try {
      await saveOnboardingProfile(profileData);
      onClose();
      router.push("/dashboard/participant");
      router.refresh();
    } catch {
      // saving state reset in finally
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(2px)",
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          zIndex: 201,
          background: "white",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #C8973A 0%, #D4A843 50%, #A07828 100%)",
          }}
        />

        <div
          style={{
            padding: "20px 24px",
            borderBottom: "0.5px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--color-gold-light)",
              border: "1px solid var(--color-gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color="var(--color-gold)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
              Ros — Profile assistant
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-ink-muted)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--color-green)",
                  display: "inline-block",
                }}
              />
              Online · Takes about 2 minutes
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-ink-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <OnboardingMessageList messages={messages} />

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--color-gold-light)",
                  border: "1px solid var(--color-gold-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={11} color="var(--color-gold)" />
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  background: "white",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: "12px 12px 12px 2px",
                  display: "flex",
                  gap: 4,
                }}
              >
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="onboarding-drawer-bounce-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      animationDelay: `${j * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {profileData && !loading && (
            <div
              style={{
                background: "var(--color-green-light)",
                border: "0.5px solid var(--color-green-border)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={18} color="var(--color-green)" />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-green)" }}>
                  Profile ready
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                Suggested first cert: <strong>{profileData.suggested_certification}</strong>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 0",
                  borderRadius: 8,
                  background: "var(--color-green)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  width: "100%",
                }}
              >
                {saving ? "Saving..." : "Save profile and continue →"}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!profileData && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "0.5px solid var(--color-border)",
              display: "flex",
              gap: 10,
              background: "white",
            }}
          >
            <input
              type="text"
              className="input-refined"
              placeholder="Type your answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                flexShrink: 0,
                background: input.trim() ? "var(--color-gold)" : "#F4F3EF",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
            >
              <Send size={16} color={input.trim() ? "white" : "var(--color-ink-hint)"} />
            </button>
          </div>
        )}

        <style>{`
          @keyframes onboarding-drawer-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
          .onboarding-drawer-bounce-dot {
            animation: onboarding-drawer-bounce 1s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>,
    document.body
  );
}
