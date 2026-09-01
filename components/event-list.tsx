import Link from "next/link";
import { BilingualName } from "@/components/bilingual-name";
import { KickoffWhen } from "@/components/kickoff-when";
import { interpolate } from "@/lib/i18n/interpolate";
import { displayName } from "@/lib/i18n/localize";
import { overlappingIds, summarizeSchedule } from "@/lib/sports/schedule";
import { addCalendarDays, cn, formatDayLabel, formatTime, zonedYmd } from "@/lib/utils";
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

function dayHeading(iso: string, count: number, locale: Locale, t: Dictionary) {
  const key = zonedYmd(iso);
  const today = zonedYmd(new Date().toISOString());
  const tomorrow = addCalendarDays(today, 1);
  const label = formatDayLabel(iso, locale);
  const matches = interpolate(t.dayMatchCount, { count });
  if (key === today) return `${t.today} · ${label} · ${matches}`;
  if (key === tomorrow) return `${t.tomorrow} · ${label} · ${matches}`;
  return `${label} · ${matches}`;
}

function timeRange(event: SportEvent, locale: Locale, t: Dictionary) {
  if (!event.timeConfirmed) return t.timeTbd;
  const start = formatTime(event.start, locale);
  const end = formatTime(event.end, locale);
  return start === end ? start : `${start}–${end}`;
}

function venueLine(event: SportEvent, locale: Locale, t: Dictionary) {
  const parts: string[] = [];
  if (event.home) parts.push(`${t.homeTeam} ${displayName(event.home, locale)}`);
  if (event.location) parts.push(displayName(event.location, locale));
  else if (!event.home) parts.push(t.locationUnknown);
  return parts.join(" · ");
}

export function EventList({
  events,
  t,
  locale,
  empty,
  emptyHref,
  emptyCta,
  showPlanner = false,
}: {
  events: SportEvent[];
  t: Dictionary;
  locale: Locale;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
  showPlanner?: boolean;
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
  const overlaps = overlappingIds(events);
  const summary = showPlanner ? summarizeSchedule(events) : null;
  const nextId = summary?.next?.sourceId;

  return (
    <div className="space-y-8">
      {summary ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <ScheduleStat value={summary.weekCount} label={t.weekAheadLabel} />
          <ScheduleStat value={summary.todayCount} label={t.today} />
          <ScheduleStat value={summary.tomorrowCount} label={t.tomorrow} />
        </div>
      ) : null}
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h3 id={`day-${group.key}`} className="mb-3 text-sm font-semibold tracking-wide text-[var(--gold)]">
            {dayHeading(group.events[0]!.start, group.events.length, locale, t)}
          </h3>
          <ol className="space-y-3">
            {group.events.map((event) => {
              const isNext = Boolean(showPlanner && nextId && event.sourceId === nextId);
              return (
                <li
                  key={event.sourceId}
                  className={cn(
                    "card px-4 py-4",
                    isNext && "border-[color-mix(in_oklab,var(--accent)_45%,var(--line))]",
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="w-[7.5rem] shrink-0 sm:w-36">
                        <time
                          dateTime={event.start}
                          className="block whitespace-nowrap font-[family-name:var(--font-serif)] text-2xl leading-none tabular-nums tracking-tight sm:text-3xl"
                        >
                          {timeRange(event, locale, t)}
                        </time>
                        <p className="mt-1 text-xs text-[var(--muted)]">{t.hktLabel}</p>
                      </div>
                      <div className="min-w-0">
                        {isNext ? (
                          <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-[var(--accent)]">
                            {t.nextKickoff}
                          </p>
                        ) : null}
                        <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
                          <BilingualName value={event.league || event.sport} locale={locale} />
                        </p>
                        <h4 className="mt-1 text-lg leading-snug">
                          <BilingualName value={event.title} locale={locale} />
                        </h4>
                        <p className="mt-1 text-sm text-[var(--muted)]">{venueLine(event, locale, t)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <KickoffWhen
                        start={event.start}
                        end={event.end}
                        timeConfirmed={event.timeConfirmed}
                        locale={locale}
                        t={t}
                      />
                      {overlaps.has(event.sourceId) ? (
                        <span className="rounded-full border border-[color-mix(in_oklab,var(--gold)_40%,var(--line))] px-2.5 py-0.5 text-xs text-[var(--gold)]">
                          {t.overlaps}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function ScheduleStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-card)_80%,transparent)] px-4 py-3">
      <p className="font-[family-name:var(--font-serif)] text-3xl tabular-nums leading-none">{value}</p>
      <p className="mt-2 text-xs tracking-wide text-[var(--muted)]">{label}</p>
    </div>
  );
}
