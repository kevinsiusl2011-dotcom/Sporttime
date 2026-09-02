"use client";

import { useState } from "react";
import type { TimeZoneOption } from "@/lib/timezone";

export function SettingsForm({
  reminderMinutes,
  timezone,
  timezones,
  includeAppearances,
  appearancesAvailable,
  saveLabel,
  remindersLabel,
  reminderHelp,
  timezoneLabel,
  timezoneHelp,
  includeAppearancesLabel,
  includeAppearancesHelp,
  resetFeedLabel,
  savedLabel,
  saveFailedLabel,
}: {
  reminderMinutes: string;
  timezone: string;
  timezones: Array<TimeZoneOption & { label: string; groupLabel: string }>;
  includeAppearances: boolean;
  appearancesAvailable: boolean;
  saveLabel: string;
  remindersLabel: string;
  reminderHelp: string;
  timezoneLabel: string;
  timezoneHelp: string;
  includeAppearancesLabel: string;
  includeAppearancesHelp: string;
  resetFeedLabel: string;
  savedLabel: string;
  saveFailedLabel: string;
}) {
  const [value, setValue] = useState(reminderMinutes);
  const [zone, setZone] = useState(timezone);
  const [appearances, setAppearances] = useState(includeAppearances);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const groups = [...new Set(timezones.map((item) => item.groupLabel))];

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderMinutes: value,
          timezone: zone,
          includeAppearances: appearances,
        }),
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
        <span className="text-sm text-[var(--muted)]">{timezoneLabel}</span>
        <select
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
        >
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {timezones
                .filter((item) => item.groupLabel === group)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <span className="mt-2 block text-sm text-[var(--muted)]">{timezoneHelp}</span>
      </label>
      <label className="block">
        <span className="text-sm text-[var(--muted)]">{remindersLabel}</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3"
        />
        <span className="mt-2 block text-sm text-[var(--muted)]">{reminderHelp}</span>
      </label>
      {appearancesAvailable ? (
        <label className="flex items-start gap-3 rounded-2xl border border-[var(--line)] px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={appearances}
            onChange={(event) => setAppearances(event.target.checked)}
          />
          <span>
            <span className="block text-sm">{includeAppearancesLabel}</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">{includeAppearancesHelp}</span>
          </span>
        </label>
      ) : null}
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
