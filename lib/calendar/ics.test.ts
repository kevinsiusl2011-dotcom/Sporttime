import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendar } from "./ics.ts";
import type { SportEvent } from "../sports/types.ts";

test("builds a calendar with an upcoming fixture", () => {
  const event: SportEvent = {
    source: "thesportsdb",
    sourceId: "123",
    title: "Arsenal vs Chelsea",
    start: "2026-09-01T18:00:00.000Z",
    end: "2026-09-01T20:30:00.000Z",
    allDay: false,
    timeConfirmed: true,
    location: "Emirates Stadium",
    description: "Premier League",
    sport: "Soccer",
    league: "English Premier League",
    home: "Arsenal",
    away: "Chelsea",
  };
  const ics = buildCalendar([event], "60");
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(
    ics.replace(/\r\n /g, ""),
    /SUMMARY:英超：阿仙奴對車路士/,
  );
  assert.match(ics, /DTSTART:20260901T180000Z/);
  assert.match(ics, /DTSTAMP:20260901T180000Z/);
  assert.match(ics, /UID:sporttime-123@sporttime/);
  assert.match(ics, /TRIGGER:-PT60M/);
  assert.match(ics, /STATUS:CONFIRMED/);
  assert.match(ics.replace(/\r\n /g, ""), /開波：/);
  assert.match(ics.replace(/\r\n /g, ""), /主隊：阿仙奴/);
  assert.match(ics.replace(/\r\n /g, ""), /用嚟排程/);
  assert.match(ics, /REFRESH-INTERVAL;VALUE=DURATION:PT1H/);
  assert.match(ics, /X-PUBLISHED-TTL:PT1H/);
  assert.match(ics, /CATEGORIES:Soccer/);
  assert.match(ics, /X-WR-TIMEZONE:Asia\/Hong_Kong/);
});

test("all-day TBA fixtures occupy the Hong Kong calendar day", () => {
  const event: SportEvent = {
    source: "thesportsdb",
    sourceId: "tba",
    title: "TBD fixture",
    start: "2026-10-01T12:00:00.000Z",
    end: "2026-10-01T14:30:00.000Z",
    allDay: true,
    timeConfirmed: false,
    location: "",
    description: "",
    sport: "Soccer",
    league: "English Premier League",
  };
  const ics = buildCalendar([event], "60");
  assert.match(ics, /DTSTART;VALUE=DATE:20261001/);
  assert.match(ics, /DTEND;VALUE=DATE:20261002/);
  assert.match(ics, /STATUS:TENTATIVE/);
});

test("keeps TheSportsDB UIDs and namespaces other sources", () => {
  const session: SportEvent = {
    source: "openf1",
    sourceId: "9140",
    title: "Spa-Francorchamps Grand Prix — Race",
    start: "2026-07-26T13:00:00.000Z",
    end: "2026-07-26T15:00:00.000Z",
    allDay: false,
    timeConfirmed: true,
    location: "Spa",
    description: "",
    sport: "Motorsport",
    league: "Formula 1",
    kind: "session",
    sessionName: "Race",
  };
  const ics = buildCalendar([session], { reminderMinutes: "60", timeZone: "Europe/London", locale: "en" });
  assert.match(ics, /UID:sporttime-openf1-9140@sporttime/);
  assert.match(ics, /X-WR-TIMEZONE:Europe\/London/);
  assert.match(ics, /CATEGORIES:Motorsport/);
});
