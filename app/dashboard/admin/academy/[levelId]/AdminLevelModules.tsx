"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { toggleModulePublished, updateModuleContent } from "../actions";

type ModuleRow = {
  id: string;
  order_index: number;
  title: string;
  description: string;
  content_html: string;
  video_url: string | null;
  has_quiz: boolean;
  is_published: boolean;
};

export function AdminLevelModules({
  levelId,
  levelTitle,
  modules: initialModules,
}: {
  levelId: string;
  levelTitle: string;
  modules: ModuleRow[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content_html: "",
    video_url: "",
  });

  const startEdit = (m: ModuleRow) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description,
      content_html: m.content_html,
      video_url: m.video_url ?? "",
    });
  };

  const saveEdit = async (moduleId: string) => {
    await updateModuleContent(moduleId, {
      title: form.title,
      description: form.description,
      content_html: form.content_html,
      video_url: form.video_url.trim() || null,
    });
    setEditingId(null);
    router.refresh();
  };

  const handleToggle = async (moduleId: string, published: boolean) => {
    await toggleModulePublished(moduleId, published);
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, is_published: published } : m))
    );
    router.refresh();
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link
          href="/dashboard/admin/academy"
          style={{
            fontSize: 13,
            color: "var(--color-gold)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Back to Academy
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap size={16} color="var(--color-gold)" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>{levelTitle}</div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{modules.length} modules</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {modules.map((m) => (
          <div
            key={m.id}
            style={{
              background: "white",
              border: "0.5px solid var(--color-border)",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--color-ink-muted)" }}>Module {m.order_index}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={m.is_published}
                  onChange={(e) => void handleToggle(m.id, e.target.checked)}
                />
                Published
              </label>
            </div>

            {editingId === m.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <input
                  className="input-refined"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Title"
                />
                <input
                  className="input-refined"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                />
                <input
                  className="input-refined"
                  style={{ width: "100%", marginBottom: 10 }}
                  value={form.video_url}
                  onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                  placeholder="Video URL (YouTube, Vimeo, or direct MP4)"
                />
                <textarea
                  className="input-refined"
                  style={{
                    width: "100%",
                    height: 280,
                    fontFamily: "monospace",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                  value={form.content_html}
                  onChange={(e) => setForm((f) => ({ ...f, content_html: e.target.value }))}
                  placeholder="HTML content"
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => void saveEdit(m.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "var(--color-gold)",
                      color: "white",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEdit(m)}
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--color-gold)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Edit content & video →
              </button>
            )}
          </div>
        ))}
        {modules.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
            No modules for this level yet. Add rows in Supabase or seed content.
          </p>
        )}
      </div>
    </>
  );
}
