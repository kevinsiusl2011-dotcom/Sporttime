import { overlappingIds, summarizeSchedule, type ScheduleSummary } from "@/lib/sports/schedule";
import type { SportEvent } from "@/lib/sports/types";
import { zonedHour } from "@/lib/timezone";
import { addCalendarDays, zonedYmd } from "@/lib/utils";

export type PlannerScope = "all" | "today" | "tomorrow" | "week";

export type PlannerFilter = {
  scope: PlannerScope;
  sport?: string;
};

export type OverlapCluster = {
  id: string;
  day: string;
  events: SportEvent[];
};

export type BusyEvening = {
  day: string;
  count: number;
  events: SportEvent[];
};

export type WeekDay = {
  key: string;
  count: number;
  isToday: boolean;
};

export function weekDays(timeZone: string, now = new Date()): string[] {
  const today = zonedYmd(now.toISOString(), timeZone);
  return Array.from({ length: 7 }, (_, index) => addCalendarDays(today, index));
}

export function eventsOnDay(events: SportEvent[], day: string, timeZone: string): SportEvent[] {
  return events.filter((event) => zonedYmd(event.start, timeZone) === day);
}

export function plannerSports(events: SportEvent[]): string[] {
  const seen = new Set<string>();
  const sports: string[] = [];
  for (const event of events) {
    const sport = event.sport?.trim();
    if (!sport || seen.has(sport)) continue;
    seen.add(sport);
    sports.push(sport);
  }
  return sports;
}

export function filterPlannerEvents(
  events: SportEvent[],
  filter: PlannerFilter,
  timeZone: string,
  now = new Date(),
): SportEvent[] {
  const today = zonedYmd(now.toISOString(), timeZone);
  const tomorrow = addCalendarDays(today, 1);
  const weekEnd = addCalendarDays(today, 6);
  return events.filter((event) => {
    if (filter.sport && event.sport !== filter.sport) return false;
    const day = zonedYmd(event.start, timeZone);
    if (filter.scope === "today") return day === today;
    if (filter.scope === "tomorrow") return day === tomorrow;
    if (filter.scope === "week") return day >= today && day <= weekEnd;
    return true;
  });
}

export function overlapClusters(events: SportEvent[], timeZone: string): OverlapCluster[] {
  const overlapIds = overlappingIds(events);
  if (overlapIds.size === 0) return [];

  const timed = events
    .filter((event) => event.timeConfirmed && overlapIds.has(event.sourceId))
    .sort((a, b) => a.start.localeCompare(b.start));

  const parent = new Map<string, string>();
  const find = (id: string): string => {
    const current = parent.get(id) ?? id;
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const left = find(a);
    const right = find(b);
    if (left !== right) parent.set(left, right);
  };

  for (const event of timed) parent.set(event.sourceId, event.sourceId);
  for (let i = 0; i < timed.length; i += 1) {
    const a = timed[i]!;
    const aEnd = new Date(a.end).getTime();
    for (let j = i + 1; j < timed.length; j += 1) {
      const b = timed[j]!;
      if (new Date(b.start).getTime() >= aEnd) break;
      if (new Date(a.start).getTime() < new Date(b.end).getTime()) union(a.sourceId, b.sourceId);
    }
  }

  const buckets = new Map<string, SportEvent[]>();
  for (const event of timed) {
    const root = find(event.sourceId);
    const list = buckets.get(root) ?? [];
    list.push(event);
    buckets.set(root, list);
  }

  return [...buckets.values()]
    .filter((group) => group.length >= 2)
    .map((group) => ({
      id: group.map((event) => event.sourceId).join("-"),
      day: zonedYmd(group[0]!.start, timeZone),
      events: group,
    }));
}

export function busyEvenings(events: SportEvent[], timeZone: string, now = new Date()): BusyEvening[] {
  const today = zonedYmd(now.toISOString(), timeZone);
  const weekEnd = addCalendarDays(today, 6);
  const byDay = new Map<string, SportEvent[]>();
  for (const event of events) {
    if (!event.timeConfirmed) continue;
    const day = zonedYmd(event.start, timeZone);
    if (day < today || day > weekEnd) continue;
    const hour = zonedHour(event.start, timeZone);
    if (hour < 18) continue;
    const list = byDay.get(day) ?? [];
    list.push(event);
    byDay.set(day, list);
  }
  return [...byDay.entries()]
    .filter(([, list]) => list.length >= 3)
    .map(([day, list]) => ({ day, count: list.length, events: list }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function plannerSummary(events: SportEvent[], timeZone: string, now = new Date()): ScheduleSummary {
  return summarizeSchedule(events, now, timeZone);
}

export function weekStrip(events: SportEvent[], timeZone: string, now = new Date()): WeekDay[] {
  const today = zonedYmd(now.toISOString(), timeZone);
  return weekDays(timeZone, now).map((key) => ({
    key,
    count: eventsOnDay(events, key, timeZone).length,
    isToday: key === today,
  }));
}
