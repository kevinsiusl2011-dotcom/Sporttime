"use client";

import { dictionaries, isLocale, type Locale } from "@/lib/i18n/dictionaries";

function readLocale(): Locale {
  if (typeof document === "undefined") return "zh-Hant";
  const match = document.cookie.match(/(?:^|; )sporttime_locale=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : "";
  return isLocale(value) ? value : "zh-Hant";
}

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = dictionaries[readLocale()];
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.errorTitle}</h1>
      <button type="button" className="btn-primary mt-6 rounded-full px-5 py-2" onClick={reset}>
        {t.errorRetry}
      </button>
    </main>
  );
}
