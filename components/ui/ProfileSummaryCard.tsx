import { Sparkles } from "lucide-react";

function getFieldIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("name")) return "👤";
  if (l.includes("location")) return "📍";
  if (l.includes("skill")) return "⚡";
  if (l.includes("rate")) return "💰";
  if (l.includes("avail")) return "📅";
  if (l.includes("bio")) return "📝";
  return "•";
}

export function ProfileSummaryCard({ content }: { content: string }) {
  const introMatch = content.match(/^([\s\S]*?)(?=\*\*Name:|Your Current Profile:)/);
  const intro = introMatch?.[1]?.trim() ?? "";

  const closingText = content.split(/Everything looks complete!|Does this all/i);
  const closing =
    closingText.length > 1 ? "Everything looks complete! " + closingText[1].trim() : "";

  const fields: { label: string; value: string }[] = [];
  const fieldRegex = /\*\*([^*]+):\*\*\s*([^*\n-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = fieldRegex.exec(content)) !== null) {
    const label = match[1].trim();
    const value = match[2].trim().replace(/^-\s*/, "");
    if (value && label !== "Your Current Profile") {
      fields.push({ label, value });
    }
  }

  return (
    <div style={{ maxWidth: "85%" }}>
      {intro && (
        <div
          style={{
            fontSize: 13,
            color: "var(--color-ink)",
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          {intro}
        </div>
      )}

      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: closing ? 10 : 0,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            background: "var(--color-gold-light)",
            borderBottom: "0.5px solid var(--color-gold-border)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Sparkles size={13} color="var(--color-gold)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gold)" }}>
            Your profile snapshot
          </span>
        </div>

        <div style={{ padding: "4px 0" }}>
          {fields.map((field, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 14px",
                borderBottom: i < fields.length - 1 ? "0.5px solid #F4F3EF" : "none",
              }}
            >
              <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                {getFieldIcon(field.label)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-ink-muted)",
                    marginBottom: 2,
                  }}
                >
                  {field.label}
                </div>
                {field.label.toLowerCase().includes("skill") ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {field.value.split(",").map((skill, j) => (
                      <span
                        key={j}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "var(--color-gold-light)",
                          border: "0.5px solid var(--color-gold-border)",
                          fontSize: 11,
                          color: "var(--color-gold)",
                          fontWeight: 500,
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : field.label.toLowerCase().includes("avail") ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "var(--color-green-light)",
                      border: "0.5px solid var(--color-green-border)",
                      fontSize: 11,
                      color: "var(--color-green)",
                      fontWeight: 500,
                    }}
                  >
                    {field.value}
                  </span>
                ) : field.label.toLowerCase().includes("rate") ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                    {field.value}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--color-ink)" }}>{field.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {closing && (
        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--color-ink)",
            lineHeight: 1.6,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {closing}
        </div>
      )}
    </div>
  );
}
