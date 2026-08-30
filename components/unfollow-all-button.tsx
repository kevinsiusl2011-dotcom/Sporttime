"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UnfollowAllButton({
  label,
  confirmLabel,
  pendingLabel,
}: {
  label: string;
  confirmLabel: string;
  pendingLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function clearAll() {
    if (!window.confirm(confirmLabel)) return;
    setPending(true);
    try {
      await fetch("/api/follows", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={clearAll}
      disabled={pending}
      className="rounded-full border border-[color-mix(in_oklab,var(--danger)_45%,var(--line))] px-4 py-2 text-sm text-[var(--danger)] hover:bg-[color-mix(in_oklab,var(--danger)_12%,transparent)]"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
