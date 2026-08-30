"use client";

import { useState } from "react";

export function CalendarSubscribe({
  feedUrl,
  googleUrl,
  title,
  help,
  copyLabel,
  copiedLabel,
  addGoogleLabel,
}: {
  feedUrl: string;
  googleUrl: string;
  title: string;
  help: string;
  copyLabel: string;
  copiedLabel: string;
  addGoogleLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="card space-y-4 p-6">
      <h2 className="font-[family-name:var(--font-serif)] text-2xl">{title}</h2>
      <p className="text-[var(--muted)]">{help}</p>
      <p className="break-all rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-sm">
        {feedUrl}
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={googleUrl} className="btn-primary rounded-full px-5 py-2.5 text-sm" target="_blank" rel="noreferrer">
          {addGoogleLabel}
        </a>
        <button type="button" className="btn-ghost rounded-full px-5 py-2.5 text-sm" onClick={copy}>
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </section>
  );
}
