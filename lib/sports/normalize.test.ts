import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isUpcoming, matchesFollow, normalizeEvent, parseSportsTimestamp, eventDurationMs } from "./normalize.ts";

describe("normalizeEvent", () => {
  it("builds a timed event from timestamp", () => {
    const event = normalizeEvent({
      idEvent: "1",
      strEvent: "Arsenal vs Chelsea",
      strLeague: "English Premier League",
      idLeague: "4328",
      strSport: "Soccer",
      dateEvent: "2026-09-12",
      strTimestamp: "2026-09-12T14:00:00+00:00",
      strVenue: "Emirates Stadium",
      strCity: "London",
      strCountry: "England",
    });
    assert.ok(event);
    assert.equal(event?.timeConfirmed, true);
    assert.equal(event?.allDay, false);
    assert.match(event?.location ?? "", /Emirates/);
  });

  it("treats bare SportsDB timestamps as UTC", () => {
    const event = normalizeEvent({
      idEvent: "1b",
      strEvent: "Chelsea vs Brighton",
      dateEvent: "2026-08-30",
      strTimestamp: "2026-08-30T13:00:00",
    });
    assert.equal(event?.start, "2026-08-30T13:00:00.000Z");
    assert.equal(parseSportsTimestamp("2026-08-30T13:00:00").toISOString(), "2026-08-30T13:00:00.000Z");
  });

  it("uses SportsDB UTC date and time when timestamp is missing", () => {
    const event = normalizeEvent({
      idEvent: "nfl",
      strEvent: "Seattle Seahawks vs New England Patriots",
      dateEvent: "2026-09-10",
      dateEventLocal: "2026-09-09",
      strTime: "00:20:00",
      strTimeLocal: "17:20:00",
    });
    assert.equal(event?.timeConfirmed, true);
    assert.equal(event?.start, "2026-09-10T00:20:00.000Z");
  });

  it("does not treat local-only kickoff as UTC", () => {
    const event = normalizeEvent({
      idEvent: "local-only",
      strEvent: "Local fixture",
      dateEventLocal: "2026-09-09",
      strTimeLocal: "17:20:00",
    });
    assert.equal(event?.timeConfirmed, false);
    assert.equal(event?.allDay, true);
    assert.equal(event?.start, "2026-09-09T12:00:00.000Z");
  });

  it("marks missing times as TBA all-day", () => {
    const event = normalizeEvent({
      idEvent: "2",
      strEvent: "TBD fixture",
      dateEvent: "2026-10-01",
      strTime: "00:00:00",
    });
    assert.ok(event);
    assert.equal(event?.timeConfirmed, false);
    assert.equal(event?.allDay, true);
  });

  it("returns null without an id or date", () => {
    assert.equal(normalizeEvent({ strEvent: "No id" }), null);
  });
});

describe("matchesFollow", () => {
  const event = normalizeEvent({
    idEvent: "3",
    strEvent: "Manchester City vs Liverpool",
    strHomeTeam: "Manchester City",
    strAwayTeam: "Liverpool",
    idLeague: "4328",
    strSport: "Soccer",
    dateEvent: "2026-11-01",
    strTimestamp: "2026-11-01T16:30:00Z",
  });
  assert.ok(event);

  it("matches teams and leagues", () => {
    assert.equal(
      matchesFollow(event!, { kind: "team", source_id: "1", label: "Liverpool" }),
      true,
    );
    assert.equal(
      matchesFollow(event!, { kind: "league", source_id: "4328", label: "EPL" }),
      true,
    );
  });

  it("matches clubs by alias", () => {
    const psg = normalizeEvent({
      idEvent: "psg",
      strEvent: "Paris SG vs Barcelona",
      strHomeTeam: "Paris SG",
      strAwayTeam: "Barcelona",
      idLeague: "4335",
      dateEvent: "2026-11-01",
      strTimestamp: "2026-11-01T20:00:00Z",
    });
    assert.equal(
      matchesFollow(psg!, { kind: "team", source_id: "1", label: "Paris Saint-Germain" }),
      true,
    );
  });
});

describe("isUpcoming", () => {
  it("keeps events that have not ended", () => {
    const event = normalizeEvent({
      idEvent: "4",
      strEvent: "Future",
      dateEvent: "2099-01-01",
      strTimestamp: "2099-01-01T12:00:00Z",
    });
    assert.equal(isUpcoming(event!), true);
  });
});

describe("eventDurationMs", () => {
  it("uses longer blocks for cricket and american football", () => {
    assert.equal(eventDurationMs("Soccer"), 2.5 * 60 * 60 * 1000);
    assert.equal(eventDurationMs("Cricket"), 8 * 60 * 60 * 1000);
    assert.equal(eventDurationMs("American Football"), 3.5 * 60 * 60 * 1000);
  });
});
