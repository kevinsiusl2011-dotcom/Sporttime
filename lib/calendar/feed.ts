import type { Locale } from "@/lib/i18n/dictionaries";
import { displayName } from "@/lib/i18n/localize";
import type { SportEvent } from "@/lib/sports/types";
import { addCalendarDays, zonedYmd } from "@/lib/utils";
import { publicAppUrl } from "@/lib/urls";

export type FeedQuery = {
  sport?: string;
  horizon?: number;
};

export function parseFeedQuery(url: URL): FeedQuery {
  const sport = url.searchParams.get("sport")?.trim() || undefined;
  const horizonRaw = url.searchParams.get("horizon");
  const horizon = horizonRaw ? Number(horizonRaw) : undefined;
  return {
    sport,
    horizon: horizon && Number.isFinite(horizon) && horizon > 0 ? Math.min(horizon, 60) : undefined,
  };
}

export function hasFeedFilter(query: FeedQuery): boolean {
  return Boolean(query.sport || query.horizon);
}

export function filterFeedEvents(
  events: SportEvent[],
  query: FeedQuery,
  timeZone: string,
  now = new Date(),
): SportEvent[] {
  const today = zonedYmd(now.toISOString(), timeZone);
  const horizonEnd = query.horizon ? addCalendarDays(today, query.horizon - 1) : null;
  return events.filter((event) => {
    if (query.sport && event.sport !== query.sport) return false;
    if (horizonEnd) {
      const day = zonedYmd(event.start, timeZone);
      if (day < today || day > horizonEnd) return false;
    }
    return true;
  });
}

export function calendarFeedName(query: FeedQuery, locale: Locale): string {
  if (query.sport && query.horizon) {
    const sport = displayName(query.sport, locale);
    return locale === "en" ? `Sporttime ${sport} · ${query.horizon}d` : `Sporttime ${sport} · ${query.horizon}日`;
  }
  if (query.sport) {
    return `Sporttime ${displayName(query.sport, locale)}`;
  }
  if (query.horizon) {
    return locale === "en" ? `Sporttime next ${query.horizon} days` : `Sporttime 未來${query.horizon}日`;
  }
  return locale === "en" ? "Sporttime fixtures" : "Sporttime 賽程";
}

export function calendarFeedDescription(locale: Locale): string {
  if (locale === "en") return "Kickoff times on your calendar for planning. Not live scores.";
  if (locale === "zh-Hans") return "开赛时间写入你的日历，方便排程。不提供即时比分。";
  return "開波時間寫入你嘅日曆，方便排程。唔提供即時比分。";
}

export function sportFeedUrl(token: string, sport: string) {
  const url = new URL(`${publicAppUrl()}/api/calendar/${token}.ics`);
  url.searchParams.set("sport", sport);
  return url.toString();
}

export function horizonFeedUrl(token: string, horizon: number) {
  const url = new URL(`${publicAppUrl()}/api/calendar/${token}.ics`);
  url.searchParams.set("horizon", String(horizon));
  return url.toString();
}

export function uniqueEventSports(events: SportEvent[]): string[] {
  const seen = new Set<string>();
  const sports: string[] = [];
  for (const event of events) {
    if (!event.sport || seen.has(event.sport)) continue;
    seen.add(event.sport);
    sports.push(event.sport);
  }
  return sports;
}
