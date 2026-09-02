import assert from "node:assert/strict";
import test from "node:test";
import { sessionToEvent } from "./openf1.ts";

test("maps an OpenF1 race session onto a calendar block", () => {
  const event = sessionToEvent({
    session_key: 9140,
    session_name: "Race",
    session_type: "Race",
    date_start: "2026-07-26T13:00:00+00:00",
    date_end: "2026-07-26T15:00:00+00:00",
    circuit_short_name: "Spa-Francorchamps",
    location: "Spa",
    country_name: "Belgium",
  });
  assert.ok(event);
  assert.equal(event.source, "openf1");
  assert.equal(event.sourceId, "9140");
  assert.equal(event.kind, "session");
  assert.equal(event.sessionName, "Race");
  assert.equal(event.league, "Formula 1");
  assert.equal(event.leagueId, "4370");
  assert.match(event.title, /Spa-Francorchamps/);
  assert.match(event.title, /Race/);
  assert.equal(event.start, "2026-07-26T13:00:00.000Z");
  assert.equal(event.timeConfirmed, true);
});

test("fills practice duration when OpenF1 omits date_end", () => {
  const event = sessionToEvent({
    session_key: 1,
    session_name: "Practice 1",
    session_type: "Practice",
    date_start: "2026-07-24T11:30:00+00:00",
    circuit_short_name: "Spa-Francorchamps",
    country_name: "Belgium",
  });
  assert.ok(event);
  assert.equal(new Date(event.end).getTime() - new Date(event.start).getTime(), 90 * 60 * 1000);
});

test("ignores sessions without a start time", () => {
  assert.equal(sessionToEvent({ session_key: 2, session_name: "Race" }), null);
});
