import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter({
  t,
  companyName,
  companyUrl,
  companyTagline,
}: {
  t: Dictionary;
  companyName?: string;
  companyUrl?: string;
  companyTagline?: string;
}) {
  return (
    <footer className="mt-20 border-t border-[var(--line)] pt-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--text)]">{t.freeToolBadge}</p>
          {companyName ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--muted)]">
                {t.courtesyOf}{" "}
                {companyUrl ? (
                  <a
                    href={companyUrl}
                    className="text-[var(--accent)] font-semibold underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {companyName}
                  </a>
                ) : (
                  <span className="text-[var(--text)]">{companyName}</span>
                )}
              </p>
              {companyTagline ? (
                <p className="text-sm leading-relaxed text-[var(--muted)]">{companyTagline}</p>
              ) : null}
            </div>
          ) : null}
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{t.footer}</p>
          <p className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-[var(--accent)] underline-offset-4 hover:underline">
              {t.privacy}
            </Link>
            <Link href="/terms" className="text-[var(--accent)] underline-offset-4 hover:underline">
              {t.terms}
            </Link>
            {companyUrl ? (
              <a
                href={companyUrl}
                className="text-[var(--accent)] font-semibold underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                daydreamprohk.ai
              </a>
            ) : null}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs tracking-[0.16em] text-[var(--muted)] uppercase">{t.brand}</p>
          {companyUrl ? (
            <p className="text-xs text-[var(--muted)]">
              出品：
              <a
                href={companyUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-[var(--muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
              >
                {companyName || companyUrl}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
