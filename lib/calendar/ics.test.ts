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
  assert.match(ics, /UID:sporttime-123@sporttime/);
  assert.match(ics, /TRIGGER:-PT60M/);
  assert.match(ics, /STATUS:CONFIRMED/);
  assert.match(ics.replace(/\r\n /g, ""), /開波：/);
  assert.match(ics.replace(/\r\n /g, ""), /主隊：阿仙奴/);
  assert.match(ics.replace(/\r\n /g, ""), /用嚟排程/);
  assert.match(ics, /REFRESH-INTERVAL;VALUE=DURATION:PT1H/);
  assert.match(ics, /X-PUBLISHED-TTL:PT1H/);
  assert.match(ics, /X-WR-TIMEZONE:Asia\/Hong_Kong/);
});
