import assert from "node:assert/strict";
import test from "node:test";
import type { SportEvent } from "./types.ts";
import { formatKickoffRelative, kickoffRelative, overlappingIds, summarizeSchedule } from "./schedule.ts";

function fixture(partial: Partial<SportEvent> & Pick<SportEvent, "sourceId" | "start" | "end">): SportEvent {
  return {
    source: "thesportsdb",
    title: "Arsenal vs Chelsea",
    allDay: false,
    timeConfirmed: true,
    location: "Emirates Stadium",
    description: "",
    sport: "Soccer",
    league: "English Premier League",
    ...partial,
  };
}

test("counts today, tomorrow, and the next seven Hong Kong days", () => {
  const now = new Date("2026-09-01T04:00:00.000Z");
  const summary = summarizeSchedule(
    [
      fixture({ sourceId: "1", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:30:00.000Z" }),
      fixture({ sourceId: "2", start: "2026-09-01T18:00:00.000Z", end: "2026-09-01T20:30:00.000Z" }),
      fixture({ sourceId: "3", start: "2026-09-02T12:00:00.000Z", end: "2026-09-02T14:30:00.000Z" }),
      fixture({ sourceId: "4", start: "2026-09-08T12:00:00.000Z", end: "2026-09-08T14:30:00.000Z" }),
    ],
    now,
  );
  assert.equal(summary.todayCount, 1);
  assert.equal(summary.tomorrowCount, 2);
  assert.equal(summary.weekCount, 3);
  assert.equal(summary.next?.sourceId, "1");
});

test("picks the in-progress fixture as next", () => {
  const now = new Date("2026-09-01T11:00:00.000Z");
  const summary = summarizeSchedule(
    [
      fixture({ sourceId: "past", start: "2026-09-01T06:00:00.000Z", end: "2026-09-01T08:00:00.000Z" }),
      fixture({ sourceId: "live", start: "2026-09-01T10:00:00.000Z", end: "2026-09-01T12:30:00.000Z" }),
    ],
    now,
  );
  assert.equal(summary.next?.sourceId, "live");
});

test("marks overlapping timed fixtures", () => {
  const ids = overlappingIds([
    fixture({ sourceId: "a", start: "2026-09-01T18:00:00.000Z", end: "2026-09-01T20:30:00.000Z" }),
    fixture({ sourceId: "b", start: "2026-09-01T19:00:00.000Z", end: "2026-09-01T21:30:00.000Z" }),
    fixture({ sourceId: "c", start: "2026-09-01T21:30:00.000Z", end: "2026-09-01T23:30:00.000Z" }),
  ]);
  assert.deepEqual([...ids].sort(), ["a", "b"]);
});

test("describes kickoff relative to now", () => {
  const now = new Date("2026-09-01T10:00:00.000Z");
  assert.equal(kickoffRelative("2026-09-01T10:20:00.000Z", "2026-09-01T12:50:00.000Z", true, now).kind, "minutes");
  assert.equal(kickoffRelative("2026-09-01T13:00:00.000Z", "2026-09-01T15:30:00.000Z", true, now).kind, "hours");
  assert.equal(kickoffRelative("2026-09-01T09:00:00.000Z", "2026-09-01T11:30:00.000Z", true, now).kind, "in_progress");
  assert.equal(kickoffRelative("2026-09-02T12:00:00.000Z", "2026-09-02T14:30:00.000Z", true, now).kind, "tomorrow");
  assert.equal(kickoffRelative("2026-09-01T10:20:00.000Z", "2026-09-01T12:50:00.000Z", false, now).kind, "tbd");
});

test("formats kickoff copy for the schedule", () => {
  const t = {
    timeTbd: "時間未定",
    inProgress: "進行中",
    kickoffInMinutes: "{count} 分鐘後開波",
    kickoffInHours: "{count} 小時後開波",
    kickoffInDays: "{count} 日後開波",
    kickoffToday: "今日 {time}",
    kickoffTomorrow: "聽日 {time}",
  };
  const now = new Date("2026-09-01T10:00:00.000Z");
  assert.equal(
    formatKickoffRelative("2026-09-01T10:20:00.000Z", "2026-09-01T12:50:00.000Z", true, "zh-Hant", t, now),
    "20 分鐘後開波",
  );
  assert.equal(
    formatKickoffRelative("2026-09-01T09:00:00.000Z", "2026-09-01T11:30:00.000Z", true, "zh-Hant", t, now),
    "進行中",
  );
  assert.equal(formatKickoffRelative("2026-09-12T12:00:00.000Z", "2026-09-12T14:30:00.000Z", true, "zh-Hant", t, now), "");
});
