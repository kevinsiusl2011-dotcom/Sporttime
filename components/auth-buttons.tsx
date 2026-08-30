"use client";

import { useState } from "react";
import { signInWithGoogleCalendar } from "@/lib/firebase/client";

export function SignInButton({ label }: { label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    try {
      const payload = await signInWithGoogleCalendar();
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Sign-in failed");
      }
      window.location.href = "/browse";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn-primary rounded-full px-5 py-2.5 text-sm" onClick={onClick} disabled={pending}>
        {pending ? "…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

export function SignOutButton({ label }: { label: string }) {
  async function onClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button className="btn-ghost rounded-full px-4 py-2 text-sm" onClick={onClick}>
      {label}
    </button>
  );
}
