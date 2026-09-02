"use client";

import { useMemo, useState } from "react";
import { EventList } from "@/components/event-list";
import { BilingualName } from "@/components/bilingual-name";
import { interpolate } from "@/lib/i18n/interpolate";
import { displayName } from "@/lib/i18n/localize";
import {
  busyEvenings,
  filterPlannerEvents,
  overlapClusters,
  plannerSports,
  plannerSummary,
  weekStrip,
  type PlannerScope,
} from "@/lib/sports/planner";
import { formatKickoffRelative } from "@/lib/sports/schedule";
import { formatDayLabel, formatTime, formatWeekdayShort, isoOnZonedDay, cn } from "@/lib/utils";
import type { SportEvent } from "@/lib/sports/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function SchedulePlanner({
  events,
  t,
  locale,
  timeZone,
  timeZoneLabel,
  empty,
  emptyHref,
  emptyCta,
}: {
  events: SportEvent[];
  t: Dictionary;
  locale: Locale;
  timeZone: string;
  timeZoneLabel: string;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
}) {
  const [scope, setScope] = useState<PlannerScope>("all");
  const [sport, setSport] = useState<string | undefined>(undefined);
  const sports = useMemo(() => plannerSports(events), [events]);

  const filtered = useMemo(
    () => filterPlannerEvents(events, { scope, sport }, timeZone),
    [events, scope, sport, timeZone],
  );
  const summary = useMemo(() => plannerSummary(events, timeZone), [events, timeZone]);
  const strip = useMemo(() => weekStrip(events, timeZone), [events, timeZone]);
  const clusters = useMemo(() => overlapClusters(filtered, timeZone), [filtered, timeZone]);
  const evenings = useMemo(() => busyEvenings(filtered, timeZone), [filtered, timeZone]);
  const next = summary.next;

  const scopes: Array<{ id: PlannerScope; label: string }> = [
    { id: "all", label: t.weekFilterAll },
    { id: "today", label: t.weekFilterToday },
    { id: "tomorrow", label: t.weekFilterTomorrow },
    { id: "week", label: t.weekFilterWeek },
  ];

  return (
    <div className="space-y-8">
      {next ? (
        <section className="card border-[color-mix(in_oklab,var(--accent)_35%,var(--line))] p-5 md:p-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--accent)]">{t.nextKickoff}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
                <BilingualName value={next.league || next.sport} locale={locale} />
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-serif)] text-2xl leading-snug md:text-3xl">
                <BilingualName value={next.title} locale={locale} />
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{t.nextKickoffHelp}</p>
            </div>
            <p className="font-[family-name:var(--font-serif)] text-3xl tabular-nums leading-none">
              {next.timeConfirmed ? formatTime(next.start, locale, timeZone) : t.timeTbd}
            </p>
          </div>
          <p className="mt-3 text-sm text-[var(--accent)]">
            {formatKickoffRelative(next.start, next.end, next.timeConfirmed, locale, t, new Date(), timeZone)}
          </p>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <ScheduleStat value={summary.weekCount} label={t.weekAheadLabel} />
        <ScheduleStat value={summary.todayCount} label={t.today} />
        <ScheduleStat value={summary.tomorrowCount} label={t.tomorrow} />
      </div>

      <nav aria-label={t.weekStripLabel} className="grid grid-cols-7 gap-1.5">
        {strip.map((day) => (
          <a
            key={day.key}
            href={`#day-${day.key}`}
            className={cn(
              "rounded-2xl border px-1 py-2 text-center transition",
              day.isToday
                ? "border-[color-mix(in_oklab,var(--accent)_45%,var(--line))] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                : "border-[var(--line)] bg-[color-mix(in_oklab,var(--bg-card)_80%,transparent)] hover:border-[color-mix(in_oklab,var(--accent)_28%,var(--line))]",
            )}
          >
            <span className="block text-[10px] tracking-wide text-[var(--muted)]">
              {formatWeekdayShort(isoOnZonedDay(day.key, timeZone), locale, timeZone)}
            </span>
            <span className="mt-1 block font-[family-name:var(--font-serif)] text-lg tabular-nums leading-none">
              {day.key.slice(-2)}
            </span>
            <span className="mt-1 block text-[10px] text-[var(--gold)]">{day.count}</span>
          </a>
        ))}
      </nav>

      <div className="flex flex-wrap gap-2">
        {scopes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScope(item.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              scope === item.id ? "btn-primary" : "btn-ghost",
            )}
          >
            {item.label}
          </button>
        ))}
        {sports.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSport(sport === item ? undefined : item)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              sport === item ? "btn-primary" : "btn-ghost",
            )}
          >
            {displayName(item, locale)}
          </button>
        ))}
      </div>

      {clusters.map((cluster) => (
        <div
          key={cluster.id}
          className="rounded-2xl border border-[color-mix(in_oklab,var(--gold)_40%,var(--line))] bg-[color-mix(in_oklab,var(--gold)_8%,transparent)] px-4 py-3"
        >
          <p className="text-sm font-medium text-[var(--gold)]">
            {interpolate(t.overlapBanner, { count: cluster.events.length })}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.overlapBannerHelp}</p>
          <p className="mt-2 text-sm">
            {cluster.events.map((event) => displayName(event.title, locale)).join(" · ")}
          </p>
        </div>
      ))}

      {evenings.map((evening) => (
        <div key={evening.day} className="rounded-2xl border border-[var(--line)] px-4 py-3">
          <p className="text-sm font-medium">{t.busyEvening}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {interpolate(t.busyEveningHelp, {
              day: formatDayLabel(isoOnZonedDay(evening.day, timeZone), locale, timeZone),
              count: evening.count,
            })}
          </p>
        </div>
      ))}

      <EventList
        events={filtered}
        t={t}
        locale={locale}
        empty={events.length === 0 ? empty : t.noEventsInFilter}
        emptyHref={events.length === 0 ? emptyHref : undefined}
        emptyCta={events.length === 0 ? emptyCta : undefined}
        timeZone={timeZone}
        timeZoneLabel={timeZoneLabel}
        nextId={next?.sourceId}
      />
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
