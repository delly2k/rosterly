"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { saveOnboardingProfile } from "./actions";
import { Send, Sparkles, CheckCircle } from "lucide-react";
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

let hasStartedOnboardingChat = false;

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

export default function OnboardingPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, profileData]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
    if (hasStartedOnboardingChat) return;
    hasStartedOnboardingChat = true;
    void sendMessage(null);
  }, [sendMessage]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;
    setSaving(true);
    try {
      await saveOnboardingProfile(profileData);
      router.push("/dashboard/participant");
      router.refresh();
    } catch {
      // saving state reset in finally
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        background: isMobile ? "white" : "var(--color-page)",
      }}
    >
      {/* LEFT PANEL — brand side */}
      {!isMobile && (
      <div
        style={{
          background:
            "linear-gradient(160deg, #1A1D23 0%, #2A2D35 60%, #1A1D23 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#C8973A",
            fontFamily: "Georgia, serif",
          }}
        >
          Roster<span style={{ color: "#F5F4F0" }}>ly</span>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(200,151,58,0.8)",
              marginBottom: 16,
            }}
          >
            Profile setup
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#F5F4F0",
              lineHeight: 1.2,
              margin: "0 0 16px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            Your professional
            <br />
            presence starts here
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 320,
            }}
          >
            Ros will help you build a profile that gets you noticed by top brands in
            Jamaica. Takes about 2 minutes.
          </p>

          <div
            style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}
          >
            {[
              { step: "01", label: "Tell us about your experience" },
              { step: "02", label: "Set your availability and rate" },
              { step: "03", label: "Get your profile and cert recommendation" },
            ].map(({ step, label }) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(200,151,58,0.15)",
                    border: "1px solid rgba(200,151,58,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#C8973A",
                    flexShrink: 0,
                  }}
                >
                  {step}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          © Rosterly · Jamaica&apos;s professional promotions platform
        </div>

        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(200,151,58,0.04)",
            border: "1px solid rgba(200,151,58,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(200,151,58,0.06)",
            border: "1px solid rgba(200,151,58,0.1)",
          }}
        />
      </div>
      )}

      {/* RIGHT PANEL — chat side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? 0 : "48px 40px",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {isMobile && (
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "0.5px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 480 100" width="100" height="21" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <text
                x="2"
                y="71"
                fontFamily="Georgia, serif"
                fontSize="80"
                fontStyle="italic"
                fontWeight="900"
                fill="#1A1A1A"
                letterSpacing="-2"
              >
                Rosterly
              </text>
              <path
                d="M 2 84 Q 160 100 330 88 Q 410 82 458 70"
                stroke="#C8973A"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-ink-muted)" }}>
              Profile setup
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isMobile ? 16 : 32,
            padding: isMobile ? "12px 16px 0" : 0,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              }}
            >
              <Sparkles size={18} color="var(--color-gold)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>
                Ros
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
                AI profile assistant · Online
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/participant")}
            style={{
              fontSize: 12,
              color: "var(--color-ink-hint)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Skip for now
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: isMobile ? "0 16px" : "0 4px 0 0",
          }}
        >
          <OnboardingMessageList messages={messages} avatarSize={28} />

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--color-gold-light)",
                  border: "1px solid var(--color-gold-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={12} color="var(--color-gold)" />
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
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="onboarding-bounce-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      animationDelay: `${i * 0.15}s`,
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
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={20} color="var(--color-green)" />
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "var(--color-green)" }}
                  >
                    Profile ready
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-ink-muted)",
                      marginTop: 2,
                    }}
                  >
                    First cert: <strong>{profileData.suggested_certification}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "var(--color-green)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  flexShrink: 0,
                }}
              >
                {saving ? "Saving..." : "Save and continue →"}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!profileData && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              padding: isMobile ? "0 16px 16px" : 0,
              flexShrink: 0,
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
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .onboarding-bounce-dot {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
