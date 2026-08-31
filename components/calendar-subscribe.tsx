"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CalendarSubscribe({ feedUrl, t }: { feedUrl: string; t: Dictionary }) {
  const [copied, setCopied] = useState(false);
  const appleUrl = feedUrl.replace(/^https?:/i, "webcal:");
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(appleUrl)}`;

  async function copy() {
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="card space-y-4 p-6">
      <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.subscribeTitle}</h2>
      <p className="rounded-2xl border border-[color-mix(in_oklab,var(--accent)_35%,var(--line))] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-4 py-3 text-sm leading-relaxed text-[var(--text)]">
        {t.autoUpdateNote}
      </p>
      <p className="text-[var(--muted)]">{t.calendarHelp}</p>
      <p className="break-all rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm">
        {feedUrl}
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={googleUrl} className="btn-primary rounded-full px-5 py-2.5 text-sm" target="_blank" rel="noreferrer">
          {t.addToGoogle}
        </a>
        <a href={appleUrl} className="btn-ghost rounded-full px-5 py-2.5 text-sm">
          {t.addToApple}
        </a>
        <button type="button" className="btn-ghost rounded-full px-5 py-2.5 text-sm" onClick={copy}>
          {copied ? t.copied : t.copyLink}
        </button>
      </div>
      <p className="text-sm text-[var(--muted)]">{t.recoveryHelp}</p>
    </section>
  );
}
