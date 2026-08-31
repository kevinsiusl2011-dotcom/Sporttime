"use client";

import { useState } from "react";

export function SettingsForm({
  reminderMinutes,
  saveLabel,
  remindersLabel,
  reminderHelp,
  resetFeedLabel,
  savedLabel,
  saveFailedLabel,
}: {
  reminderMinutes: string;
  saveLabel: string;
  remindersLabel: string;
  reminderHelp: string;
  resetFeedLabel: string;
  savedLabel: string;
  saveFailedLabel: string;
}) {
  const [value, setValue] = useState(reminderMinutes);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderMinutes: value }),
      });
      setMessage(response.ok ? savedLabel : saveFailedLabel);
    } catch {
      setMessage(saveFailedLabel);
    } finally {
      setPending(false);
    }
  }

  async function resetFeed() {
    if (!confirm(resetFeedLabel)) return;
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rotateFeed: true }),
    });
    if (response.ok) window.location.reload();
  }

  return (
    <div className="mt-8 space-y-6">
      <label className="block">
        <span className="text-sm text-[var(--muted)]">{remindersLabel}</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
        />
        <span className="mt-2 block text-sm text-[var(--muted)]">{reminderHelp}</span>
      </label>
      <button type="button" className="btn-primary rounded-full px-5 py-2.5" onClick={save} disabled={pending}>
        {pending ? "…" : saveLabel}
      </button>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button type="button" className="block text-sm text-[var(--danger)]" onClick={resetFeed}>
        {resetFeedLabel}
      </button>
    </div>
  );
}
