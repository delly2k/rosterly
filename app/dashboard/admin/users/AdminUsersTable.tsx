"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  Search,
} from "lucide-react";
import {
  activateUser,
  banUser,
  suspendUser,
  type ProfileRow,
} from "@/app/dashboard/admin/actions";
import { ROLES } from "@/lib/roles";
import EmptyState from "@/components/ui/EmptyState";

export function AdminUsersTable({ users }: { users: ProfileRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 8,
            padding: "0 12px",
            height: 36,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search size={14} color="var(--color-ink-muted)" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              flex: 1,
              background: "none",
            }}
          />
        </div>
        {(["all", "participant", "merchant", "admin"] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(role)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              background: roleFilter === role ? "var(--color-gold)" : "white",
              border: `0.5px solid ${roleFilter === role ? "var(--color-gold)" : "var(--color-border)"}`,
              color: roleFilter === role ? "white" : "var(--color-ink-muted)",
              cursor: "pointer",
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No users found"
          description="Try adjusting your search or filter"
        />
      ) : (
      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#F9F8F5",
                borderBottom: "0.5px solid var(--color-border)",
              }}
            >
              {["User", "Role", "Status", "Joined", "Actions"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "0.5px solid var(--color-border)",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FAFAF8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "var(--color-gold-light)",
                          border: "1px solid var(--color-gold-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--color-gold)",
                          flexShrink: 0,
                        }}
                      >
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "?"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-ink)",
                          }}
                        >
                          {user.name ?? "No name set"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-ink-muted)",
                            marginTop: 1,
                          }}
                        >
                          {user.email ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background:
                          user.role === "admin"
                            ? "#EFF6FF"
                            : user.role === "merchant"
                              ? "var(--color-gold-light)"
                              : "#F4F3EF",
                        border: `0.5px solid ${
                          user.role === "admin"
                            ? "#BFDBFE"
                            : user.role === "merchant"
                              ? "var(--color-gold-border)"
                              : "var(--color-border)"
                        }`,
                        color:
                          user.role === "admin"
                            ? "#2563EB"
                            : user.role === "merchant"
                              ? "var(--color-gold)"
                              : "var(--color-ink-muted)",
                      }}
                    >
                      {user.role === "admin"
                        ? "🛡️"
                        : user.role === "merchant"
                          ? "🏢"
                          : "👤"}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background:
                          user.status === "active"
                            ? "var(--color-green-light)"
                            : user.status === "suspended"
                              ? "var(--color-warning-light)"
                              : user.status === "banned"
                                ? "var(--color-danger-light)"
                                : "#F4F3EF",
                        border: `0.5px solid ${
                          user.status === "active"
                            ? "var(--color-green-border)"
                            : user.status === "suspended"
                              ? "rgba(217,119,6,0.3)"
                              : user.status === "banned"
                                ? "rgba(220,38,38,0.2)"
                                : "var(--color-border)"
                        }`,
                        color:
                          user.status === "active"
                            ? "var(--color-green)"
                            : user.status === "suspended"
                              ? "var(--color-warning)"
                              : user.status === "banned"
                                ? "var(--color-danger)"
                                : "var(--color-ink-muted)",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "currentColor",
                        }}
                      />
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 12,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {new Date(user.created_at).toLocaleDateString("en-JM", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    {user.role === ROLES.ADMIN ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            border: "0.5px solid var(--color-border)",
                            background: "white",
                            color: "var(--color-ink)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Eye size={12} /> View
                        </Link>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-ink-hint)",
                            fontStyle: "italic",
                          }}
                        >
                          Admin — cannot modify
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            border: "0.5px solid var(--color-border)",
                            background: "white",
                            color: "var(--color-ink)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Eye size={12} /> View
                        </Link>

                        {user.status !== "active" && (
                          <form action={activateUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                background: "var(--color-green-light)",
                                border: "0.5px solid var(--color-green-border)",
                                color: "var(--color-green)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <CheckCircle size={12} /> Activate
                            </button>
                          </form>
                        )}

                        {user.status !== "suspended" && (
                          <form action={suspendUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                background: "var(--color-warning-light)",
                                border: "0.5px solid rgba(217,119,6,0.3)",
                                color: "var(--color-warning)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <PauseCircle size={12} /> Suspend
                            </button>
                          </form>
                        )}

                        {user.status !== "banned" && (
                          <form action={banUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                background: "var(--color-danger-light)",
                                border: "0.5px solid rgba(220,38,38,0.2)",
                                color: "var(--color-danger)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <XCircle size={12} /> Ban
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
