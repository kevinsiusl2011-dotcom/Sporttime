"use client";

import { useEffect, useState } from "react";
import {
  completeRedirectSignIn,
  explainSignInError,
  signInWithGoogleCalendar,
  type GoogleSignInPayload,
} from "@/lib/firebase/client";

let finishing: Promise<void> | null = null;

async function finishSession(payload: GoogleSignInPayload) {
  if (finishing) return finishing;
  finishing = (async () => {
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
  })().catch((err) => {
    finishing = null;
    throw err;
  });
  return finishing;
}

export function SignInButton({ label, locale = "zh-Hant" }: { label: string; locale?: "zh-Hant" | "en" }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await completeRedirectSignIn();
        if (!payload || cancelled) return;
        setPending(true);
        await finishSession(payload);
      } catch (err) {
        if (!cancelled) setError(explainSignInError(err, locale));
      } finally {
        if (!cancelled) setPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  async function onClick() {
    setPending(true);
    setError(null);
    try {
      const payload = await signInWithGoogleCalendar();
      await finishSession(payload);
    } catch (err) {
      setError(explainSignInError(err, locale));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn-primary rounded-full px-5 py-2.5 text-sm" onClick={onClick} disabled={pending}>
        {pending ? "…" : label}
      </button>
      {error ? <p className="mt-2 max-w-sm text-sm text-[var(--danger)]">{error}</p> : null}
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
