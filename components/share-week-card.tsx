"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ShareWeekCard({
  t,
  shareUrl,
}: {
  t: Dictionary;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const text = (t.shareTextTemplate || "").replace("{url}", shareUrl);

  async function copy(value: string) {
    try {
      if (navigator.share) {
        await navigator.share({ title: t.shareWeekTitle, text, url: shareUrl });
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <section className="card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-serif)] text-xl md:text-2xl leading-tight">
            {t.shareWeekTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {t.shareWeekBody}
          </p>
          <p className="mt-3 break-all rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--muted)]">
            {text}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost rounded-full px-4 py-2 text-sm"
            onClick={() => copy(shareUrl)}
          >
            {copied ? t.shareCopied : t.shareCopyLink}
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost rounded-full px-4 py-2 text-sm"
          >
            WhatsApp
          </a>
          <Link
            href="/preview"
            className="btn-ghost rounded-full px-4 py-2 text-sm"
          >
            {t.goToPreview}
          </Link>
        </div>
      </div>
    </section>
  );
}
