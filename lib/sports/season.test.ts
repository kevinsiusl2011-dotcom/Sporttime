import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentSeason, nearbySeasons } from "./season.ts";

describe("currentSeason", () => {
  it("uses a split year for soccer after July", () => {
    assert.equal(currentSeason("Soccer", new Date("2026-08-29")), "2026-2027");
  });

  it("uses the previous split year before July", () => {
    assert.equal(currentSeason("Soccer", new Date("2026-03-01")), "2025-2026");
  });

  it("uses calendar year for motorsport", () => {
    assert.equal(currentSeason("Motorsport", new Date("2026-08-29")), "2026");
  });

  it("uses calendar year for golf and esports", () => {
    assert.equal(currentSeason("Golf", new Date("2026-08-29")), "2026");
    assert.equal(currentSeason("Esports", new Date("2026-08-29")), "2026");
  });

  it("uses calendar year for NFL", () => {
    assert.equal(currentSeason("American Football", new Date("2026-09-01")), "2026");
  });

  it("switches soccer season on the Hong Kong calendar", () => {
    assert.equal(currentSeason("Soccer", new Date("2026-06-30T16:30:00.000Z")), "2026-2027");
    assert.equal(currentSeason("Soccer", new Date("2026-06-30T15:30:00.000Z")), "2025-2026");
  });
});

describe("nearbySeasons", () => {
  it("includes neighbours for split seasons", () => {
    const seasons = nearbySeasons("Soccer", new Date("2026-08-29"));
    assert.deepEqual(seasons, ["2026-2027", "2025-2026", "2027-2028"]);
  });
});
