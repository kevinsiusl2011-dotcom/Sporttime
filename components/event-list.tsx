import { eventHeadline, formatLocalized, trilingual } from "@/lib/i18n/localize";
import { formatDateTime } from "@/lib/utils";
import type { SportEvent } from "@/lib/sports/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function EventList({
  events,
  t,
  locale,
  empty,
}: {
  events: SportEvent[];
  t: Dictionary;
  locale: Locale;
  empty: string;
}) {
  if (events.length === 0) {
    return <p className="text-[var(--muted)]">{empty}</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.sourceId} className="card flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
              {trilingual(event.league || event.sport)}
            </p>
            <EventTitle league={event.league} title={event.title} />
            <p className="text-sm text-[var(--muted)]">
              {event.location ? trilingual(event.location) : t.locationUnknown}
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

function EventTitle({ league, title }: { league: string; title: string }) {
  return <h3 className="mt-1 text-lg leading-snug">{formatLocalized(eventHeadline(league, title))}</h3>;
}
