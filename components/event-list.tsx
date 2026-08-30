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
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold)]">{event.league || event.sport}</p>
            <h3 className="mt-1 text-lg">{event.title}</h3>
            <p className="text-sm text-[var(--muted)]">
              {event.location || t.locationUnknown}
            </p>
          </div>
          <div className="text-sm text-[var(--muted)] md:text-right">
            {event.timeConfirmed ? formatDateTime(event.start, locale) : t.timeTbd}
          </div>
        </li>
      ))}
    </ol>
  );
}
