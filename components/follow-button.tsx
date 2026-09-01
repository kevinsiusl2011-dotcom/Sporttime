"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FollowKind } from "@/lib/sports/types";

export function FollowButton({
  kind,
  sourceId,
  label,
  sport,
  extra,
  following,
  followLabel,
  unfollowLabel,
  errorLabel = "操作失敗，請再試。",
  pendingLabel = "…",
}: {
  kind: FollowKind;
  sourceId: string;
  label: string;
  sport?: string;
  extra?: Record<string, unknown>;
  following: boolean;
  followLabel: string;
  unfollowLabel: string;
  errorLabel?: string;
  pendingLabel?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [on, setOn] = useState(following);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOn(following);
  }, [following]);

  async function toggle() {
    setPending(true);
    setError(null);
    const next = !on;
    setOn(next);
    try {
      const response = await fetch("/api/follows", {
        method: on ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, sourceId, label, sport, extra }),
      });
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        setOn(on);
        setError(errorLabel);
        return;
      }
      router.refresh();
    } catch {
      setOn(on);
      setError(errorLabel);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={on}
        aria-busy={pending}
        className={`rounded-full px-4 py-2 text-sm ${on ? "btn-ghost" : "btn-primary"}`}
      >
        {pending ? pendingLabel : on ? unfollowLabel : followLabel}
      </button>
      {error ? <p className="max-w-[10rem] text-right text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
