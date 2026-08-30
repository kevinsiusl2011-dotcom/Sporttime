import { parseReminders } from "@/lib/env";
import type { SportEvent } from "@/lib/sports/types";

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function fold(line: string) {
  if (line.length <= 74) return line;
  let output = line.slice(0, 74);
  let rest = line.slice(74);
  while (rest.length) {
    output += `\r\n ${rest.slice(0, 73)}`;
    rest = rest.slice(73);
  }
  return output;
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

function vevent(event: SportEvent, reminders: number[]) {
  const summary = event.league ? `${event.league}: ${event.title}` : event.title;
  const lines = [
    "BEGIN:VEVENT",
    `UID:sporttime-${event.sourceId}@sporttime`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    event.allDay || !event.timeConfirmed
      ? `DTSTART;VALUE=DATE:${dayStamp(event.start)}`
      : `DTSTART:${utcStamp(event.start)}`,
    event.allDay || !event.timeConfirmed ? `DTEND;VALUE=DATE:${dayStamp(event.end)}` : `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  for (const minutes of reminders.slice(0, 5)) {
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(summary)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM");
  }
  lines.push("END:VEVENT");
  return lines;
}

export function buildCalendar(events: SportEvent[], reminderMinutes?: string) {
  const reminders = parseReminders(reminderMinutes);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sporttime//Fixtures//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Sporttime",
    "X-WR-CALDESC:Upcoming sports fixtures from Sporttime",
  ];
  for (const event of events) lines.push(...vevent(event, reminders));
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
