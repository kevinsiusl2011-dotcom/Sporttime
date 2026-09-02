import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter({
  t,
  companyName,
  companyUrl,
}: {
  t: Dictionary;
  companyName?: string;
  companyUrl?: string;
}) {
  return (
    <footer className="mt-20 border-t border-[var(--line)] pt-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">{t.freeToolBadge}</p>
          {companyName ? (
            <p className="text-sm text-[var(--muted)]">
              {t.courtesyOf}{" "}
              {companyUrl ? (
                <a
                  href={companyUrl}
                  className="text-[var(--accent)] underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {companyName}
                </a>
              ) : (
                <span className="text-[var(--text)]">{companyName}</span>
              )}
            </p>
          ) : null}
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{t.footer}</p>
          <p className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-[var(--accent)] underline-offset-4 hover:underline">
              {t.privacy}
            </Link>
            <Link href="/terms" className="text-[var(--accent)] underline-offset-4 hover:underline">
              {t.terms}
            </Link>
          </p>
        </div>
        <p className="text-xs tracking-[0.16em] text-[var(--muted)] uppercase">{t.brand}</p>
      </div>
    </footer>
  );
}
