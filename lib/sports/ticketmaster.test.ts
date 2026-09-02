import assert from "node:assert/strict";
import test from "node:test";
import { ticketmasterToEvent } from "./ticketmaster.ts";

test("maps a ticketed appearance and skips fixture-like names", () => {
  const event = ticketmasterToEvent(
    {
      id: "tm1",
      name: "Lionel Messi Meet & Greet",
      url: "https://example.com",
      dates: { start: { dateTime: "2026-10-01T18:00:00Z" } },
      _embedded: { venues: [{ name: "Kaseya Center", city: { name: "Miami" }, country: { name: "USA" } }] },
      classifications: [{ segment: { name: "Miscellaneous" }, genre: { name: "Special" } }],
    },
    "Soccer",
  );
  assert.ok(event);
  assert.equal(event.source, "ticketmaster");
  assert.equal(event.kind, "appearance");
  assert.equal(event.sport, "Soccer");
  assert.equal(event.timeConfirmed, true);
  assert.match(event.location, /Miami/);
});

test("drops events that look like official fixtures", () => {
  assert.equal(
    ticketmasterToEvent({
      id: "tm2",
      name: "Inter Miami vs LAFC",
      dates: { start: { dateTime: "2026-10-01T18:00:00Z" } },
    }),
    null,
  );
});
