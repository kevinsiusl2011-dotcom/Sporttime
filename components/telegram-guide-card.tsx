import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TelegramGuideCard({
  t,
}: {
  t: Dictionary;
}) {
  return (
    <section className="card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-serif)] text-xl md:text-2xl leading-tight">
            {t.telegramTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {t.telegramBody}
          </p>
          <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-[var(--text)]">
            <li>{t.telegramStep1}</li>
            <li>{t.telegramStep2}</li>
            <li>{t.telegramStep3}</li>
          </ol>
        </div>
        <div className="shrink-0">
          <a
            href="/settings"
            className="btn-ghost rounded-full px-5 py-2.5 text-sm"
          >
            {t.telegramCta}
          </a>
        </div>
      </div>
    </section>
  );
}
