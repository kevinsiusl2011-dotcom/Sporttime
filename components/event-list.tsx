import Link from "next/link";
import { BilingualName } from "@/components/bilingual-name";
import { formatDateTime } from "@/lib/utils";
import type { SportEvent } from "@/lib/sports/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function EventList({
  events,
  t,
  locale,
  empty,
  emptyHref,
  emptyCta,
}: {
  events: SportEvent[];
  t: Dictionary;
  locale: Locale;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-[var(--muted)]">{empty}</p>
        {emptyHref && emptyCta ? (
          <Link href={emptyHref} className="btn-primary inline-flex rounded-full px-5 py-2.5 text-sm">
            {emptyCta}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.sourceId} className="card flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
              <BilingualName value={event.league || event.sport} locale={locale} />
            </p>
            <h3 className="mt-1 text-lg leading-snug">
              <BilingualName value={event.title} locale={locale} />
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {event.location ? <BilingualName value={event.location} locale={locale} /> : t.locationUnknown}
            </p>
          </div>
          <div className="text-sm text-[var(--muted)] md:text-right">
            {event.timeConfirmed ? formatDateTime(event.start, locale, "Asia/Hong_Kong") : t.timeTbd}
          </div>
        </li>
      ))}
    </ol>
  );
}
