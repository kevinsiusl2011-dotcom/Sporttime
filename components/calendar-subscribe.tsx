"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
  return Promise.resolve();
}

function subscribeUrls(feedUrl: string) {
  const appleUrl = feedUrl.replace(/^https?:/i, "webcal:");
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(appleUrl)}`;
  return { appleUrl, googleUrl };
}

export type CalendarFeedOption = { label: string; url: string };

export function CalendarSubscribe({
  feedUrl,
  t,
  feeds = [],
}: {
  feedUrl: string;
  t: Dictionary;
  feeds?: CalendarFeedOption[];
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const { appleUrl, googleUrl } = subscribeUrls(feedUrl);

  async function copy(url: string) {
    setCopyError(false);
    try {
      await copyText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopyError(true);
    }
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
        <button type="button" className="btn-ghost rounded-full px-5 py-2.5 text-sm" onClick={() => copy(feedUrl)}>
          {copied === feedUrl ? t.copied : t.copyLink}
        </button>
      </div>
      {feeds.length > 0 ? (
        <div className="space-y-3 border-t border-[var(--line)] pt-4">
          <h3 className="font-[family-name:var(--font-serif)] text-xl">{t.sportFeedsTitle}</h3>
          <p className="text-sm text-[var(--muted)]">{t.sportFeedsHelp}</p>
          <ul className="space-y-3">
            {feeds.map((feed) => {
              const urls = subscribeUrls(feed.url);
              return (
                <li key={feed.url} className="rounded-2xl border border-[var(--line)] px-4 py-3">
                  <p className="text-sm font-medium">{feed.label}</p>
                  <p className="mt-1 break-all text-xs text-[var(--muted)]">{feed.url}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={urls.googleUrl} className="btn-ghost rounded-full px-3 py-1.5 text-xs" target="_blank" rel="noreferrer">
                      {t.addToGoogle}
                    </a>
                    <a href={urls.appleUrl} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
                      {t.addToApple}
                    </a>
                    <button type="button" className="btn-ghost rounded-full px-3 py-1.5 text-xs" onClick={() => copy(feed.url)}>
                      {copied === feed.url ? t.copied : t.copyLink}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {copyError ? <p className="text-sm text-[var(--danger)]">{t.copyFailed}</p> : null}
      <p className="text-sm text-[var(--muted)]">{t.recoveryHelp}</p>
    </section>
  );
}
