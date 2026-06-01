"use client";

export function AccountActions() {
  return (
    <form action="/api/auth/signout" method="post">
      <button type="submit" className="btn-settings-secondary">
        Sign out
      </button>
    </form>
  );
}
