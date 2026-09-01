import { interpolate } from "@/lib/i18n/interpolate";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { SportEvent } from "@/lib/sports/types";
import { addCalendarDays, formatTime, zonedYmd } from "@/lib/utils";

export type ScheduleSummary = {
  todayCount: number;
  tomorrowCount: number;
  weekCount: number;
  next: SportEvent | null;
};

export type KickoffRelative =
  | { kind: "tbd" }
  | { kind: "in_progress" }
  | { kind: "minutes"; count: number }
  | { kind: "hours"; count: number }
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "days"; count: number }
  | { kind: "later" };

type KickoffCopy = {
  timeTbd: string;
  inProgress: string;
  kickoffInMinutes: string;
  kickoffInHours: string;
  kickoffInDays: string;
  kickoffToday: string;
  kickoffTomorrow: string;
};

function ymdDiff(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const from = Date.UTC(fy ?? 0, (fm ?? 1) - 1, fd ?? 1);
  const to = Date.UTC(ty ?? 0, (tm ?? 1) - 1, td ?? 1);
  return Math.round((to - from) / 86_400_000);
}

export function summarizeSchedule(events: SportEvent[], now = new Date()): ScheduleSummary {
  const today = zonedYmd(now.toISOString());
  const tomorrow = addCalendarDays(today, 1);
  const weekEnd = addCalendarDays(today, 6);
  const nowMs = now.getTime();
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  let todayCount = 0;
  let tomorrowCount = 0;
  let weekCount = 0;
  let next: SportEvent | null = null;

  for (const event of sorted) {
    const day = zonedYmd(event.start);
    if (day === today) todayCount += 1;
    if (day === tomorrow) tomorrowCount += 1;
    if (day >= today && day <= weekEnd) weekCount += 1;
    if (!next && new Date(event.end).getTime() >= nowMs) next = event;
  }

  return { todayCount, tomorrowCount, weekCount, next };
}

export function overlappingIds(events: SportEvent[]): Set<string> {
  const ids = new Set<string>();
  const timed = events
    .filter((event) => event.timeConfirmed)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  for (let i = 0; i < timed.length; i += 1) {
    const a = timed[i]!;
    const aStart = new Date(a.start).getTime();
    const aEnd = new Date(a.end).getTime();
    for (let j = i + 1; j < timed.length; j += 1) {
      const b = timed[j]!;
      const bStart = new Date(b.start).getTime();
      if (bStart >= aEnd) break;
      const bEnd = new Date(b.end).getTime();
      if (aStart < bEnd && bStart < aEnd) {
        ids.add(a.sourceId);
        ids.add(b.sourceId);
      }
    }
  }
  return ids;
}

export function kickoffRelative(
  startIso: string,
  endIso: string,
  timeConfirmed: boolean,
  now = new Date(),
): KickoffRelative {
  if (!timeConfirmed) return { kind: "tbd" };
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const current = now.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return { kind: "later" };
  if (current >= start && current < end) return { kind: "in_progress" };
  if (current >= end) return { kind: "later" };

  const minutes = Math.max(1, Math.round((start - current) / 60_000));
  if (minutes < 60) return { kind: "minutes", count: minutes };
  const hours = Math.max(1, Math.round(minutes / 60));
  if (hours < 12) return { kind: "hours", count: hours };

  const today = zonedYmd(now.toISOString());
  const startDay = zonedYmd(startIso);
  if (startDay === today) return { kind: "today" };
  const days = ymdDiff(today, startDay);
  if (days === 1) return { kind: "tomorrow" };
  if (days >= 2 && days <= 6) return { kind: "days", count: days };
  return { kind: "later" };
}

export function formatKickoffRelative(
  startIso: string,
  endIso: string,
  timeConfirmed: boolean,
  locale: Locale,
  t: KickoffCopy,
  now = new Date(),
): string {
  const relative = kickoffRelative(startIso, endIso, timeConfirmed, now);
  switch (relative.kind) {
    case "tbd":
      return t.timeTbd;
    case "in_progress":
      return t.inProgress;
    case "minutes":
      return interpolate(t.kickoffInMinutes, { count: relative.count });
    case "hours":
      return interpolate(t.kickoffInHours, { count: relative.count });
    case "days":
      return interpolate(t.kickoffInDays, { count: relative.count });
    case "today":
      return interpolate(t.kickoffToday, { time: formatTime(startIso, locale) });
    case "tomorrow":
      return interpolate(t.kickoffTomorrow, { time: formatTime(startIso, locale) });
    default:
      return "";
  }
}
