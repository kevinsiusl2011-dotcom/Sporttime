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
});

describe("nearbySeasons", () => {
  it("includes neighbours for split seasons", () => {
    const seasons = nearbySeasons("Soccer", new Date("2026-08-29"));
    assert.deepEqual(seasons, ["2026-2027", "2025-2026", "2027-2028"]);
  });
});
