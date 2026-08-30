import { eventFingerprint } from "@/lib/sports/normalize";
import { upcomingForFollow } from "@/lib/sports/thesportsdb";
import { deleteCalendarEvent, ensureSporttimeCalendar, upsertCalendarEvent } from "@/lib/calendar/google";
import { dbAll, dbGet, dbRun, type FollowRow } from "@/lib/db";
import { parseReminders } from "@/lib/env";
import type { SportEvent } from "@/lib/sports/types";

export type SyncResult = {
  scanned: number;
  created: number;
  updated: number;
  removed: number;
  errors: string[];
};

export async function collectUpcoming(userId: string): Promise<SportEvent[]> {
  const follows = await dbAll<FollowRow>("SELECT * FROM follows WHERE user_id = ?", [userId]);
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
      events.set(event.sourceId, event);
    }
  }

  return [...events.values()].sort((a, b) => a.start.localeCompare(b.start));
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
    const upcoming = await collectUpcoming(user.user_id);
    events += upcoming.length;
  }
  return { users: users.length, events };
}

export async function syncAllUsers(): Promise<{ users: number; results: SyncResult[] }> {
  const refreshed = await refreshAllFeeds();
  return { users: refreshed.users, results: [] };
}
