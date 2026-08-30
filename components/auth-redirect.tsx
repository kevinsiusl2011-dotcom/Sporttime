"use client";

import { useEffect, useState } from "react";
import {
  completeGoogleRedirect,
  explainSignInError,
  hasPendingGoogleRedirect,
  reportSignInError,
} from "@/lib/firebase/client";
import { finishSporttimeSession } from "@/lib/firebase/session";
import type { Locale } from "@/lib/i18n/dictionaries";

export function AuthRedirect({
  locale,
  completingLabel,
}: {
  locale: Locale;
  completingLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (hasPendingGoogleRedirect()) setStatus("working");
      try {
        const payload = await completeGoogleRedirect();
        if (!payload || cancelled) {
          if (!cancelled) setStatus("idle");
          return;
        }
        setStatus("working");
        await finishSporttimeSession(payload);
      } catch (err) {
        reportSignInError(err);
        if (!cancelled) {
          setStatus("error");
          setError(explainSignInError(err, locale));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (status === "idle") return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <p
        className={`rounded-full px-4 py-2 text-sm shadow ${
          status === "error"
            ? "bg-[var(--danger)] text-white"
            : "bg-[var(--card)] text-[var(--fg)]"
        }`}
      >
        {status === "error" ? error : completingLabel}
      </p>
    </div>
  );
}
