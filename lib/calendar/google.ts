import { google, type calendar_v3 } from "googleapis";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { dbGet, dbRun, type GoogleAccountRow } from "@/lib/db";
import type { SportEvent } from "@/lib/sports/types";
import { addCalendarDays, DEFAULT_TIME_ZONE } from "@/lib/utils";

const CALENDAR_NAME = "Sporttime";
const SOURCE_KEY = "sporttimeSourceId";

function oauthClient() {
  return new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
    `${process.env.AUTH_URL ?? "http://localhost:3000"}/api/auth/callback/google`,
  );
}

export async function calendarClient(userId: string) {
  const row = await dbGet<GoogleAccountRow>("SELECT * FROM google_accounts WHERE user_id = ?", [userId]);
  if (!row) throw new Error("GOOGLE_NOT_CONNECTED");

  const auth = oauthClient();
  const refreshPlain = decryptSecret(row.refresh_token_enc);
  auth.setCredentials({
    refresh_token: refreshPlain === "access-only" ? undefined : refreshPlain,
    access_token: row.access_token_enc ? decryptSecret(row.access_token_enc) : undefined,
    expiry_date: row.access_expires_at ?? undefined,
  });

  auth.on("tokens", (tokens) => {
    const access = tokens.access_token ? encryptSecret(tokens.access_token) : row.access_token_enc;
    const refresh = tokens.refresh_token ? encryptSecret(tokens.refresh_token) : row.refresh_token_enc;
    void dbRun(
      `UPDATE google_accounts
       SET access_token_enc = ?, refresh_token_enc = ?, access_expires_at = ?, updated_at = datetime('now')
       WHERE user_id = ?`,
      [access, refresh, tokens.expiry_date ?? row.access_expires_at, userId],
    );
  });

  return google.calendar({ version: "v3", auth });
}

export async function ensureSporttimeCalendar(userId: string): Promise<string> {
  const stored = await dbGet<{ calendar_id: string | null }>(
    "SELECT calendar_id FROM google_accounts WHERE user_id = ?",
    [userId],
  );
  const api = await calendarClient(userId);

  if (stored?.calendar_id) {
    try {
      await api.calendars.get({ calendarId: stored.calendar_id });
      return stored.calendar_id;
    } catch {
      // recreate below
    }
  }

  try {
    const created = await api.calendars.insert({
      requestBody: {
        summary: CALENDAR_NAME,
        description: "Upcoming sports fixtures synced by your self-hosted Sporttime instance.",
        timeZone: DEFAULT_TIME_ZONE,
      },
    });
    const id = created.data.id;
    if (!id) throw new Error("CALENDAR_CREATE_FAILED");
    await dbRun("UPDATE google_accounts SET calendar_id = ?, updated_at = datetime('now') WHERE user_id = ?", [
      id,
      userId,
    ]);
    return id;
  } catch {
    await dbRun("UPDATE google_accounts SET calendar_id = ?, updated_at = datetime('now') WHERE user_id = ?", [
      "primary",
      userId,
    ]);
    return "primary";
  }
}

export function toCalendarEvent(
  event: SportEvent,
  reminders: number[],
): calendar_v3.Schema$Event {
  const base: calendar_v3.Schema$Event = {
    summary: event.league ? `${event.league}: ${event.title}` : event.title,
    description: event.description,
    location: event.location || undefined,
    source: { title: "Sporttime", url: "https://www.thesportsdb.com" },
    extendedProperties: {
      private: {
        [SOURCE_KEY]: `${event.source}:${event.sourceId}`,
        sporttime: "1",
      },
    },
    reminders: {
      useDefault: false,
      overrides: reminders.slice(0, 5).map((minutes) => ({ method: "popup", minutes })),
    },
  };

  if (event.allDay || !event.timeConfirmed) {
    const day = event.start.slice(0, 10);
    return { ...base, start: { date: day }, end: { date: addCalendarDays(day, 1) } };
  }

  return {
    ...base,
    start: { dateTime: event.start },
    end: { dateTime: event.end },
  };
}

export async function upsertCalendarEvent(
  userId: string,
  calendarId: string,
  event: SportEvent,
  existingId: string | null,
  reminders: number[],
): Promise<string> {
  const api = await calendarClient(userId);
  const body = toCalendarEvent(event, reminders);

  if (existingId) {
    try {
      const updated = await api.events.update({
        calendarId,
        eventId: existingId,
        requestBody: body,
      });
      if (updated.data.id) return updated.data.id;
    } catch {
      // insert a replacement if the old event was deleted in Google Calendar
    }
  }

  const created = await api.events.insert({ calendarId, requestBody: body });
  if (!created.data.id) throw new Error("EVENT_INSERT_FAILED");
  return created.data.id;
}

export async function deleteCalendarEvent(userId: string, calendarId: string, eventId: string) {
  const api = await calendarClient(userId);
  try {
    await api.events.delete({ calendarId, eventId });
  } catch {
    // already gone
  }
}
