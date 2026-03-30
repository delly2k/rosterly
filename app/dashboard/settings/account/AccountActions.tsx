"use client";

import { useState } from "react";

export function AccountActions() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Sign out
        </button>
      </form>

      <div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Delete account
        </button>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Permanently delete your account. Not yet implemented — contact support.
        </p>
      </div>

      {showDeleteConfirm && (
        <div
          className="rounded-lg border border-zinc-200 bg-amber-50 p-4 dark:border-zinc-700 dark:bg-amber-950/20"
          role="dialog"
          aria-labelledby="delete-dialog-title"
        >
          <h3 id="delete-dialog-title" className="font-medium text-zinc-900 dark:text-zinc-100">
            Delete account?
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            This action is not available yet. Contact support if you need to delete your account.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
