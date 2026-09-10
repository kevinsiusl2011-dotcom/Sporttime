import { eventFingerprint } from "@/lib/sports/normalize";
import { upcomingForFollow } from "@/lib/sports/thesportsdb";
import { calendarFeedDescription, calendarFeedName, filterFeedEvents, hasFeedFilter, type FeedQuery } from "@/lib/calendar/feed";
import { deleteCalendarEvent, ensureSporttimeCalendar, upsertCalendarEvent } from "@/lib/calendar/google";
import { buildCalendar } from "@/lib/calendar/ics";
import { nextRevisions, parseStoredFeed, serializeStoredFeed } from "@/lib/calendar/revisions";
import { dbAll, dbGet, dbRun, type FollowRow, type UserRow } from "@/lib/db";
import { parseReminders } from "@/lib/env";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { followWantsF1, mergeOpenF1Sessions } from "@/lib/sports/f1";
import { upcomingF1Sessions } from "@/lib/sports/openf1";
import { appearancesForAthletes, ticketmasterConfigured } from "@/lib/sports/ticketmaster";
import type { FollowKind, SportEvent } from "@/lib/sports/types";
import { resolveTimeZone } from "@/lib/timezone";

/** Rebuild cached ICS / preview JSON at least this often so subscriptions stay fresh. */
export const FEED_TTL_MS = 45 * 60 * 1000;

export type SyncResult = {
  scanned: number;
  created: number;
  updated: number;
  removed: number;
  errors: string[];
};

export async function collectUpcoming(userId: string): Promise<SportEvent[]> {
  const [follows, user] = await Promise.all([
    dbAll<FollowRow>("SELECT * FROM follows WHERE user_id = ?", [userId]),
    dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [userId]),
  ]);
  const events = new Map<string, SportEvent>();

  // Keep free-tier SportsDB under its request budget when many leagues are followed.
  const batches = await mapPool(follows, 2, async (follow) => {
    try {
      return await upcomingForFollow(follow);
    } catch (error) {
      console.error("Failed to load fixtures for follow", follow.id, error);
      return [] as SportEvent[];
    }
  });

  for (const batch of batches) {
    for (const event of batch) {
      events.set(`${event.source}:${event.sourceId}`, event);
    }
  }

  if (follows.some(followWantsF1)) {
    try {
      mergeOpenF1Sessions(events, await upcomingF1Sessions());
    } catch (error) {
      console.error("Failed to merge F1 sessions", userId, error);
    }
  }

  if (user?.include_appearances && ticketmasterConfigured()) {
    try {
      const extras = await appearancesForAthletes(follows.filter((follow) => follow.kind === "athlete"));
      for (const event of extras) {
        events.set(`${event.source}:${event.sourceId}`, event);
      }
    } catch (error) {
      console.error("Failed to load appearances", userId, error);
    }
  }

  return [...events.values()].sort((a, b) => a.start.localeCompare(b.start));
}

export async function rebuildUserFeed(userId: string): Promise<SportEvent[]> {
  const events = await collectUpcoming(userId);
  const user = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [userId]);
  const locale = isLocale(user?.locale) ? user.locale : "zh-Hant";
  const previous = parseStoredFeed(user?.feed_events_json);
  const generatedAt = new Date().toISOString();
  const revisions = nextRevisions(events, previous.revisions, generatedAt);
  const ics = buildCalendar(events, {
    reminderMinutes: user?.reminder_minutes,
    timeZone: resolveTimeZone(user?.timezone),
    locale,
    revisions,
    generatedAt,
  });
  await dbRun(
    `UPDATE users SET feed_ics = ?, feed_events_json = ?, feed_built_at = ?, updated_at = datetime('now') WHERE id = ?`,
    [ics, serializeStoredFeed(events, revisions), Date.now(), userId],
  );
  return events;
}

export function feedIsStale(user: Pick<UserRow, "feed_built_at">) {
  return Date.now() - Number(user.feed_built_at ?? 0) >= FEED_TTL_MS;
}

function snapshotFromUser(user: UserRow) {
  const stored = parseStoredFeed(user.feed_events_json);
  return {
    events: stored.events,
    revisions: stored.revisions,
    builtAt: Number(user.feed_built_at ?? 0),
    ics: user.feed_ics ?? null,
  };
}

async function loadFeedSnapshot(user: UserRow, preferCache: boolean) {
  const cached = snapshotFromUser(user);
  const hasCache = user.feed_events_json != null && user.feed_events_json !== "";
  if (hasCache && (preferCache || !feedIsStale(user))) {
    return cached;
  }
  try {
    await rebuildUserFeed(user.id);
    const fresh = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [user.id]);
    return fresh ? snapshotFromUser(fresh) : cached;
  } catch (error) {
    if (hasCache) return cached;
    throw error;
  }
}

export async function eventsForPreview(userId: string): Promise<SportEvent[]> {
  const user = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) return rebuildUserFeed(userId);
  return (await loadFeedSnapshot(user, false)).events;
}

export async function calendarBodyForUser(
  user: UserRow,
  query: FeedQuery = {},
): Promise<{ ics: string; builtAt: number }> {
  const snapshot = await loadFeedSnapshot(user, true);
  const timeZone = resolveTimeZone(user.timezone);
  const locale = isLocale(user.locale) ? user.locale : "zh-Hant";
  if (!hasFeedFilter(query) && snapshot.ics) {
    return { ics: snapshot.ics, builtAt: snapshot.builtAt };
  }
  const filtered = filterFeedEvents(snapshot.events, query, timeZone);
  return {
    ics: buildCalendar(filtered, {
      reminderMinutes: user.reminder_minutes,
      timeZone,
      locale,
      name: calendarFeedName(query, locale),
      description: calendarFeedDescription(locale),
      revisions: snapshot.revisions,
      generatedAt: snapshot.builtAt ? new Date(snapshot.builtAt).toISOString() : undefined,
    }),
    builtAt: snapshot.builtAt,
  };
}

async function mapPool<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()));
  return results;
}

export async function syncUserCalendar(userId: string): Promise<SyncResult> {
  const user = await dbGet<{ reminder_minutes: string }>("SELECT reminder_minutes FROM users WHERE id = ?", [userId]);
  const reminders = parseReminders(user?.reminder_minutes);
  const calendarId = await ensureSporttimeCalendar(userId);
  const events = await collectUpcoming(userId);
  const existing = await dbAll<{ source_id: string; calendar_event_id: string; last_hash: string }>(
    "SELECT source_id, calendar_event_id, last_hash FROM synced_events WHERE user_id = ?",
    [userId],
  );
  const existingMap = new Map(existing.map((row) => [row.source_id, row]));

  const result: SyncResult = { scanned: events.length, created: 0, updated: 0, removed: 0, errors: [] };
  const keep = new Set<string>();

  for (const event of events) {
    keep.add(event.sourceId);
    const hash = eventFingerprint(event);
    const previous = existingMap.get(event.sourceId);
    if (previous && previous.last_hash === hash) continue;

    try {
      const calendarEventId = await upsertCalendarEvent(
        userId,
        calendarId,
        event,
        previous?.calendar_event_id ?? null,
        reminders,
      );
      await dbRun(
        `INSERT INTO synced_events (user_id, source, source_id, calendar_event_id, last_hash, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id, source, source_id) DO UPDATE SET
           calendar_event_id = excluded.calendar_event_id,
           last_hash = excluded.last_hash,
           updated_at = datetime('now')`,
        [userId, event.source, event.sourceId, calendarEventId, hash],
      );
      if (previous) result.updated += 1;
      else result.created += 1;
    } catch (error) {
      result.errors.push(`${event.title}: ${error instanceof Error ? error.message : "sync failed"}`);
    }
  }

  for (const row of existing) {
    if (keep.has(row.source_id)) continue;
    try {
      await deleteCalendarEvent(userId, calendarId, row.calendar_event_id);
      await dbRun("DELETE FROM synced_events WHERE user_id = ? AND source_id = ?", [userId, row.source_id]);
      result.removed += 1;
    } catch (error) {
      result.errors.push(`remove ${row.source_id}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return result;
}

export async function refreshAllFeeds(): Promise<{ users: number; events: number }> {
  const users = await dbAll<{ user_id: string }>("SELECT DISTINCT user_id FROM follows");
  let events = 0;
  for (const user of users) {
    const upcoming = await rebuildUserFeed(user.user_id);
    events += upcoming.length;
  }
  return { users: users.length, events };
}

export async function syncAllUsers(): Promise<{ users: number; results: SyncResult[] }> {
  const refreshed = await refreshAllFeeds();
  return { users: refreshed.users, results: [] };
}

function syntheticFollow(kind: FollowKind, sourceId: string, sport?: string): FollowRow {
  return {
    id: `public-${kind}-${sourceId}`,
    user_id: "public",
    kind,
    source_id: sourceId,
    label: "",
    sport: sport ?? null,
    extra_json: null,
    added_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: "thesportsdb",
  } as unknown as FollowRow;
}

export async function eventsForEntity(
  kind: FollowKind,
  sourceId: string,
  sport?: string,
): Promise<SportEvent[]> {
  const follow = syntheticFollow(kind, sourceId, sport);
  const events = new Map<string, SportEvent>();
  try {
    const batch = await upcomingForFollow(follow);
    for (const event of batch) {
      events.set(`${event.source}:${event.sourceId}`, event);
    }
  } catch (error) {
    console.error("Failed to load fixtures for entity", kind, sourceId, error);
    return [];
  }
  if (followWantsF1(follow)) {
    try {
      mergeOpenF1Sessions(events, await upcomingF1Sessions());
    } catch (error) {
      console.error("Failed to merge F1 sessions for entity", kind, sourceId, error);
    }
  }
  return [...events.values()].sort((a, b) => a.start.localeCompare(b.start));
}

export async function calendarBodyForEntity(
  kind: FollowKind,
  sourceId: string,
  options?: {
    locale?: Locale;
    timeZone?: string;
    title?: string;
    description?: string;
    sport?: string;
  },
): Promise<string> {
  const { t, locale: defaultLocale } = await getDictionary();
  const locale = options?.locale ?? defaultLocale;
  const timeZone = resolveTimeZone(options?.timeZone ?? "Asia/Hong_Kong");
  const events = await eventsForEntity(kind, sourceId, options?.sport);
  const filtered = filterFeedEvents(events, {}, timeZone);
  const name =
    options?.title ||
    (locale === "en"
      ? `Sporttime · ${kind === "team" ? "Team" : kind === "league" ? "League" : "Sport"} calendar`
      : locale === "zh-Hans"
      ? `Sporttime · 赛事日历`
      : `Sporttime · 賽事日曆`);
  const description = options?.description ?? calendarFeedDescription(locale);
  const titleHint = typeof (t as unknown as { noAccountNote?: string }).noAccountNote === "string"
    ? (t as unknown as { noAccountNote: string }).noAccountNote
    : "";
  return buildCalendar(filtered, {
    reminderMinutes: undefined,
    timeZone,
    locale,
    name,
    description: titleHint ? `${description}\n\n${titleHint}` : description,
  });
}

