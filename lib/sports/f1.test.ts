import assert from "node:assert/strict";
import test from "node:test";
import { F1_LEAGUE_ID, followWantsF1, mergeOpenF1Sessions } from "./f1.ts";
import type { SportEvent } from "./types.ts";

function event(partial: Partial<SportEvent> & Pick<SportEvent, "source" | "sourceId" | "start">): SportEvent {
  return {
    title: "Belgian Grand Prix",
    end: new Date(new Date(partial.start).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    allDay: false,
    timeConfirmed: true,
    location: "Spa",
    description: "",
    sport: "Motorsport",
    league: "Formula 1",
    leagueId: F1_LEAGUE_ID,
    ...partial,
  };
}

test("detects F1 follows from league, label, extra, or motorsport sport follow", () => {
  assert.equal(
    followWantsF1({ kind: "league", source_id: F1_LEAGUE_ID, label: "Formula 1", sport: "Motorsport", extra_json: null }),
    true,
  );
  assert.equal(
    followWantsF1({ kind: "team", source_id: "1", label: "Mercedes", sport: "Motorsport", extra_json: JSON.stringify({ leagueId: F1_LEAGUE_ID }) }),
    true,
  );
  assert.equal(
    followWantsF1({ kind: "sport", source_id: "Motorsport", label: "Motorsport", sport: "Motorsport", extra_json: null }),
    true,
  );
  assert.equal(
    followWantsF1({ kind: "league", source_id: "4328", label: "English Premier League", sport: "Soccer", extra_json: null }),
    false,
  );
});

test("replaces a TheSportsDB race block when OpenF1 has the same grand prix", () => {
  const events = new Map<string, SportEvent>([
    [
      "thesportsdb:gp",
      event({ source: "thesportsdb", sourceId: "gp", start: "2026-07-26T13:00:00.000Z" }),
    ],
  ]);
  mergeOpenF1Sessions(events, [
    event({
      source: "openf1",
      sourceId: "race",
      start: "2026-07-26T13:05:00.000Z",
      title: "Spa Grand Prix — Race",
      sessionName: "Race",
      kind: "session",
    }),
    event({
      source: "openf1",
      sourceId: "fp1",
      start: "2026-07-24T11:30:00.000Z",
      title: "Spa Grand Prix — Practice 1",
      sessionName: "Practice 1",
      kind: "session",
    }),
  ]);
  assert.equal([...events.values()].some((item) => item.source === "thesportsdb"), false);
  assert.equal([...events.values()].filter((item) => item.source === "openf1").length, 2);
});
