"use client";

import { useState } from "react";
import { explainSignInError, reportSignInError, startGoogleSignIn } from "@/lib/firebase/client";

export function SignInButton({
  label,
  pendingLabel,
  locale = "zh-Hant",
}: {
  label: string;
  pendingLabel?: string;
  locale?: "zh-Hant" | "en";
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    try {
      await startGoogleSignIn();
    } catch (err) {
      reportSignInError(err);
      setError(explainSignInError(err, locale));
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn-primary rounded-full px-5 py-2.5 text-sm" onClick={onClick} disabled={pending}>
        {pending ? pendingLabel ?? "…" : label}
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
