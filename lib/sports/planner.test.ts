import assert from "node:assert/strict";
import test from "node:test";
import type { SportEvent } from "./types.ts";
import { busyEvenings, filterPlannerEvents, overlapClusters, plannerSports, weekStrip } from "./planner.ts";

function fixture(partial: Partial<SportEvent> & Pick<SportEvent, "sourceId" | "start" | "end">): SportEvent {
  return {
    source: "thesportsdb",
    title: "Match",
    allDay: false,
    timeConfirmed: true,
    location: "",
    description: "",
    sport: "Soccer",
    league: "English Premier League",
    ...partial,
  };
}

test("filters the planner to today in Hong Kong", () => {
  const now = new Date("2026-09-01T04:00:00.000Z");
  const events = [
    fixture({ sourceId: "today", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:30:00.000Z" }),
    fixture({ sourceId: "tomorrow", start: "2026-09-01T18:00:00.000Z", end: "2026-09-01T20:30:00.000Z" }),
    fixture({
      sourceId: "nba",
      sport: "Basketball",
      start: "2026-09-01T10:30:00.000Z",
      end: "2026-09-01T13:00:00.000Z",
    }),
  ];
  const today = filterPlannerEvents(events, { scope: "today" }, "Asia/Hong_Kong", now);
  assert.deepEqual(
    today.map((event) => event.sourceId).sort(),
    ["nba", "today"],
  );
  const soccer = filterPlannerEvents(events, { scope: "all", sport: "Soccer" }, "Asia/Hong_Kong", now);
  assert.deepEqual(
    soccer.map((event) => event.sourceId).sort(),
    ["today", "tomorrow"],
  );
});

test("clusters overlapping fixtures", () => {
  const clusters = overlapClusters(
    [
      fixture({ sourceId: "a", start: "2026-09-01T18:00:00.000Z", end: "2026-09-01T20:30:00.000Z" }),
      fixture({ sourceId: "b", start: "2026-09-01T19:00:00.000Z", end: "2026-09-01T21:30:00.000Z" }),
      fixture({ sourceId: "c", start: "2026-09-01T21:30:00.000Z", end: "2026-09-01T23:30:00.000Z" }),
    ],
    "Asia/Hong_Kong",
  );
  assert.equal(clusters.length, 1);
  assert.deepEqual(
    clusters[0]!.events.map((event) => event.sourceId).sort(),
    ["a", "b"],
  );
});

test("flags a packed evening in the local timezone", () => {
  const now = new Date("2026-09-01T04:00:00.000Z");
  const evenings = busyEvenings(
    [
      fixture({ sourceId: "1", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:00:00.000Z" }),
      fixture({ sourceId: "2", start: "2026-09-01T11:00:00.000Z", end: "2026-09-01T13:00:00.000Z" }),
      fixture({ sourceId: "3", start: "2026-09-01T12:30:00.000Z", end: "2026-09-01T14:30:00.000Z" }),
      fixture({ sourceId: "afternoon", start: "2026-09-01T04:00:00.000Z", end: "2026-09-01T06:00:00.000Z" }),
    ],
    "Asia/Hong_Kong",
    now,
  );
  assert.equal(evenings.length, 1);
  assert.equal(evenings[0]!.count, 3);
});

test("builds a seven-day strip with counts", () => {
  const now = new Date("2026-09-01T04:00:00.000Z");
  const strip = weekStrip(
    [
      fixture({ sourceId: "1", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:00:00.000Z" }),
      fixture({ sourceId: "2", start: "2026-09-01T18:00:00.000Z", end: "2026-09-01T20:00:00.000Z" }),
    ],
    "Asia/Hong_Kong",
    now,
  );
  assert.equal(strip.length, 7);
  assert.equal(strip[0]!.isToday, true);
  assert.equal(strip[0]!.count, 1);
  assert.equal(strip[1]!.count, 1);
  assert.deepEqual(plannerSports([fixture({ sourceId: "1", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:00:00.000Z", sport: "Soccer" })]), [
    "Soccer",
  ]);
});
