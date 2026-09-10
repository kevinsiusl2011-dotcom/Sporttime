import type { Dictionary } from "@/lib/i18n/dictionaries";

export type BannerVariant = "hero" | "preview" | "footer";

export function LeadGenBanner({
  t,
  companyName,
  companyUrl,
  companyTagline,
  variant = "hero",
}: {
  t: Dictionary;
  companyName: string;
  companyUrl: string;
  companyTagline?: string;
  variant?: BannerVariant;
}) {
  const wrapper =
    variant === "footer"
      ? "mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-transparent"
      : variant === "preview"
      ? "mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-transparent"
      : "mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-transparent";

  return (
    <section className={`${wrapper} px-5 py-4 md:px-6 md:py-5`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.14em] text-[var(--muted)] uppercase">
            {t.broughtToYou}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
            <a
              href={companyUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {companyName}
            </a>
            {companyTagline ? <span className="text-[var(--muted)]"> · {companyTagline}</span> : null}
            <span className="text-[var(--muted)]">
              {" "}
              · {(t as Dictionary & { creditLine?: string }).creditLine || ""}
            </span>
          </p>
        </div>
        <div>
          <a
            href={companyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
          >
            {t.leadGenCtaPrimary} →
          </a>
        </div>
      </div>
    </section>
  );
}
