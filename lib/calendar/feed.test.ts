import assert from "node:assert/strict";
import test from "node:test";
import { calendarFeedName, filterFeedEvents, hasFeedFilter, parseFeedQuery } from "./feed.ts";
import type { SportEvent } from "../sports/types.ts";

function fixture(partial: Partial<SportEvent> & Pick<SportEvent, "sourceId" | "start" | "sport">): SportEvent {
  return {
    source: "thesportsdb",
    title: "Match",
    end: new Date(new Date(partial.start).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    allDay: false,
    timeConfirmed: true,
    location: "",
    description: "",
    league: "League",
    ...partial,
  };
}

test("parses sport and horizon from the calendar URL", () => {
  const query = parseFeedQuery(new URL("https://example.com/api/calendar/token.ics?sport=Soccer&horizon=7"));
  assert.deepEqual(query, { sport: "Soccer", horizon: 7 });
  assert.equal(hasFeedFilter(query), true);
  assert.equal(hasFeedFilter({}), false);
});

test("filters a feed to one sport and the next seven Hong Kong days", () => {
  const now = new Date("2026-09-01T04:00:00.000Z");
  const events = [
    fixture({ sourceId: "1", sport: "Soccer", start: "2026-09-01T10:00:00.000Z" }),
    fixture({ sourceId: "2", sport: "Basketball", start: "2026-09-01T10:00:00.000Z" }),
    fixture({ sourceId: "3", sport: "Soccer", start: "2026-09-12T10:00:00.000Z" }),
  ];
  const filtered = filterFeedEvents(events, { sport: "Soccer", horizon: 7 }, "Asia/Hong_Kong", now);
  assert.deepEqual(
    filtered.map((event) => event.sourceId),
    ["1"],
  );
});

test("names filtered calendars in Chinese and English", () => {
  assert.equal(calendarFeedName({}, "zh-Hant"), "Sporttime 賽程");
  assert.match(calendarFeedName({ sport: "Soccer" }, "zh-Hant"), /足球/);
  assert.match(calendarFeedName({ horizon: 7 }, "en"), /7 days/);
});
