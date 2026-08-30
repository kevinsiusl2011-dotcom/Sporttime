"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
}: {
  kind: FollowKind;
  sourceId: string;
  label: string;
  sport?: string;
  extra?: Record<string, unknown>;
  following: boolean;
  followLabel: string;
  unfollowLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [on, setOn] = useState(following);

  async function toggle() {
    setPending(true);
    try {
      await fetch("/api/follows", {
        method: on ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, sourceId, label, sport, extra }),
      });
      setOn(!on);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`rounded-full px-4 py-2 text-sm ${on ? "btn-ghost" : "btn-primary"}`}
    >
      {on ? unfollowLabel : followLabel}
    </button>
  );
}
