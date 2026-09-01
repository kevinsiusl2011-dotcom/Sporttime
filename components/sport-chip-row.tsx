import Link from "next/link";
import { BilingualName } from "@/components/bilingual-name";
import type { Locale } from "@/lib/i18n/dictionaries";
import { sportSlug } from "@/lib/sports/catalog";

export function SportChipRow({
  sports,
  selected,
  hrefFor,
  locale,
}: {
  sports: string[];
  selected: string;
  hrefFor: (slug: string) => string;
  locale: Locale;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {sports.map((sport) => {
        const slug = sportSlug(sport);
        const on = sport === selected;
        return (
          <Link
            key={sport}
            href={hrefFor(slug)}
            className={`rounded-full px-4 py-2 text-sm ${
              on
                ? "bg-[var(--accent)] font-semibold text-[var(--accent-ink)]"
                : "border border-[var(--line)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            <BilingualName value={sport} locale={locale} />
          </Link>
        );
      })}
    </div>
  );
}
