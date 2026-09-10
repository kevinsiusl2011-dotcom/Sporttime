import { eventRevisionKey, type FeedRevision } from "@/lib/calendar/revisions";
import { parseReminders } from "@/lib/env";
import type { Locale } from "@/lib/i18n/dictionaries";
import { displayName, eventDescription, eventSummary } from "@/lib/i18n/localize";
import type { SportEvent } from "@/lib/sports/types";
import { DEFAULT_TIME_ZONE } from "@/lib/timezone";
import { addCalendarDays } from "@/lib/utils";

export type CalendarOptions = {
  reminderMinutes?: string;
  timeZone?: string;
  locale?: Locale;
  name?: string;
  description?: string;
  revisions?: Record<string, FeedRevision>;
  generatedAt?: string;
};

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** RFC 5545 folds at 75 octets, not JS characters — CJK summaries are 3 bytes each. */
function fold(line: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let offset = 0;
  let limit = 75;
  while (offset < bytes.length) {
    let end = Math.min(offset + limit, bytes.length);
    while (end > offset && end < bytes.length && (bytes[end]! & 0b1100_0000) === 0b1000_0000) {
      end -= 1;
    }
    chunks.push(decoder.decode(bytes.subarray(offset, end)));
    offset = end;
    limit = 74;
  }
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function utcStamp(iso: string) {
  const date = new Date(iso);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function dayStamp(iso: string) {
  return iso.slice(0, 10).replaceAll("-", "");
}

function nextDayStamp(iso: string) {
  return addCalendarDays(iso.slice(0, 10), 1).replaceAll("-", "");
}

function eventUid(event: SportEvent) {
  if (event.source === "thesportsdb") return `sporttime-${event.sourceId}@sporttime`;
  return `sporttime-${event.source}-${event.sourceId}@sporttime`;
}

function vevent(
  event: SportEvent,
  reminders: number[],
  locale: Locale,
  timeZone: string,
  revision?: FeedRevision,
  generatedAt?: string,
) {
  const summary = eventSummary(event.league, event.title, locale);
  const description = eventDescription(
    {
      league: event.league,
      title: event.title,
      location: event.location,
      timeConfirmed: event.timeConfirmed,
      start: event.start,
      home: event.home,
      away: event.away,
    },
    timeZone,
  );
  const stamp = utcStamp(revision?.stamp || generatedAt || event.start);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${eventUid(event)}`,
    `DTSTAMP:${stamp}`,
    `LAST-MODIFIED:${stamp}`,
    `SEQUENCE:${revision?.sequence ?? 0}`,
    event.allDay || !event.timeConfirmed
      ? `DTSTART;VALUE=DATE:${dayStamp(event.start)}`
      : `DTSTART:${utcStamp(event.start)}`,
    event.allDay || !event.timeConfirmed
      ? `DTEND;VALUE=DATE:${nextDayStamp(event.start)}`
      : `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `STATUS:${event.timeConfirmed ? "CONFIRMED" : "TENTATIVE"}`,
  ];
  if (event.sport) lines.push(`CATEGORIES:${escapeText(event.sport)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(displayName(event.location, locale))}`);
  for (const minutes of reminders.slice(0, 5)) {
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(summary)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM");
  }
  lines.push("END:VEVENT");
  return lines;
}

function resolveOptions(options?: string | CalendarOptions): CalendarOptions {
  if (typeof options === "string") return { reminderMinutes: options };
  return options ?? {};
}

export function buildCalendar(events: SportEvent[], options?: string | CalendarOptions) {
  const resolved = resolveOptions(options);
  const reminders = parseReminders(resolved.reminderMinutes);
  const timeZone = resolved.timeZone || DEFAULT_TIME_ZONE;
  const locale = resolved.locale ?? "zh-Hant";
  const name = resolved.name || (locale === "en" ? "Sporttime fixtures" : "Sporttime 賽程");
  const description =
    resolved.description ||
    (locale === "en"
      ? "Kickoff times on your calendar for planning. Not live scores."
      : locale === "zh-Hans"
        ? "开赛时间写入你的日历，方便排程。不提供即时比分。"
        : "開波時間寫入你嘅日曆，方便排程。唔提供即時比分。");
  const generatedAt = resolved.generatedAt;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sporttime//Fixtures//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-CALDESC:${escapeText(description)}`,
    `X-WR-TIMEZONE:${timeZone}`,
  ];
  if (generatedAt) lines.push(`LAST-MODIFIED:${utcStamp(generatedAt)}`);
  for (const event of events) {
    lines.push(
      ...vevent(
        event,
        reminders,
        locale,
        timeZone,
        resolved.revisions?.[eventRevisionKey(event)],
        generatedAt,
      ),
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
