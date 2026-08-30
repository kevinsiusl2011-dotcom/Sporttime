"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function RestoreFeedForm({ t }: { t: Dictionary }) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function restore() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        setMessage(t.restoreFailed);
        return;
      }
      setMessage(t.restoreOk);
      window.location.reload();
    } catch {
      setMessage(t.restoreFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card mt-8 space-y-4 p-6">
      <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.restoreTitle}</h2>
      <p className="text-[var(--muted)]">{t.restoreHelp}</p>
      <input
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder={t.restorePlaceholder}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
      />
      <button className="btn-primary rounded-full px-5 py-2.5" onClick={restore} disabled={pending || token.trim().length < 8}>
        {t.restoreAction}
      </button>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </section>
  );
}
