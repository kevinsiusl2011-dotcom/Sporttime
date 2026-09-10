import assert from "node:assert/strict";
import test from "node:test";
import { nextRevisions, parseStoredFeed, serializeStoredFeed } from "./revisions.ts";
import type { SportEvent } from "../sports/types.ts";

function fixture(start: string): SportEvent {
  return {
    source: "thesportsdb",
    sourceId: "123",
    title: "Arsenal vs Chelsea",
    start,
    end: "2026-09-01T20:30:00.000Z",
    allDay: false,
    timeConfirmed: true,
    location: "Emirates",
    description: "Premier League",
    sport: "Soccer",
    league: "English Premier League",
  };
}

test("parses legacy event arrays and wrapped feeds", () => {
  const event = fixture("2026-09-01T18:00:00.000Z");
  const legacy = parseStoredFeed(JSON.stringify([event]));
  assert.equal(legacy.events.length, 1);
  assert.deepEqual(legacy.revisions, {});

  const wrapped = parseStoredFeed(
    serializeStoredFeed(legacy.events, {
      "thesportsdb:123": { sequence: 1, stamp: "2026-09-10T00:00:00.000Z", hash: "abc" },
    }),
  );
  assert.equal(wrapped.revisions["thesportsdb:123"]?.sequence, 1);
  assert.equal(parseStoredFeed(null).events.length, 0);
});

test("increments SEQUENCE and keeps stamps monotonic when a fixture changes", () => {
  const first = fixture("2026-09-01T18:00:00.000Z");
  const created = nextRevisions([first], {}, "2026-09-08T00:00:00.000Z");
  assert.equal(created["thesportsdb:123"]?.sequence, 0);

  const unchanged = nextRevisions([first], created, "2026-09-09T00:00:00.000Z");
  assert.equal(unchanged["thesportsdb:123"]?.sequence, 0);
  assert.equal(unchanged["thesportsdb:123"]?.stamp, "2026-09-08T00:00:00.000Z");

  const movedEarlier = fixture("2026-09-01T16:00:00.000Z");
  const updated = nextRevisions([movedEarlier], unchanged, "2026-09-10T00:00:00.000Z");
  assert.equal(updated["thesportsdb:123"]?.sequence, 1);
  assert.equal(updated["thesportsdb:123"]?.stamp, "2026-09-10T00:00:00.000Z");
});
