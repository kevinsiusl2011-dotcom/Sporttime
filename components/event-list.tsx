import Link from "next/link";
import { BilingualName } from "@/components/bilingual-name";
import { addCalendarDays, formatDayLabel, formatTime, zonedYmd } from "@/lib/utils";
import type { SportEvent } from "@/lib/sports/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

function groupByDay(events: SportEvent[]) {
  const groups: Array<{ key: string; events: SportEvent[] }> = [];
  const index = new Map<string, number>();
  for (const event of events) {
    const key = zonedYmd(event.start);
    const existing = index.get(key);
    if (existing === undefined) {
      index.set(key, groups.length);
      groups.push({ key, events: [event] });
    } else {
      groups[existing]!.events.push(event);
    }
  }
  return groups;
}

function dayHeading(iso: string, locale: Locale, t: Dictionary) {
  const key = zonedYmd(iso);
  const today = zonedYmd(new Date().toISOString());
  const tomorrow = addCalendarDays(today, 1);
  const label = formatDayLabel(iso, locale);
  if (key === today) return `${t.today} · ${label}`;
  if (key === tomorrow) return `${t.tomorrow} · ${label}`;
  return label;
}

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

  const groups = groupByDay(events);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h3 id={`day-${group.key}`} className="mb-3 text-sm font-semibold tracking-wide text-[var(--gold)]">
            {dayHeading(group.events[0]!.start, locale, t)}
          </h3>
          <ol className="space-y-3">
            {group.events.map((event) => (
              <li
                key={event.sourceId}
                className="card flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
                    <BilingualName value={event.league || event.sport} locale={locale} />
                  </p>
                  <h4 className="mt-1 text-lg leading-snug">
                    <BilingualName value={event.title} locale={locale} />
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    {event.location ? <BilingualName value={event.location} locale={locale} /> : t.locationUnknown}
                  </p>
                </div>
                <div className="shrink-0 text-sm tabular-nums text-[var(--muted)] md:text-right">
                  {event.timeConfirmed ? formatTime(event.start, locale) : t.timeTbd}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
