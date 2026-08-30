import assert from "node:assert/strict";
import test from "node:test";
import { listCatalogSports } from "./catalog.ts";
import { popularAthletesForSport, searchPopularAthletes } from "./popular-athletes.ts";

test("lists thirty popular athletes for every catalogue sport", () => {
  for (const sport of listCatalogSports()) {
    const athletes = popularAthletesForSport(sport);
    assert.equal(athletes.length, 30, sport);
    const ids = new Set(athletes.map((athlete) => athlete.id));
    assert.equal(ids.size, 30, sport);
  }
});

test("search finds Chinese and English star names", () => {
  const messi = searchPopularAthletes("美斯");
  assert.ok(messi.some((athlete) => athlete.name === "Lionel Messi"));
  const ding = searchPopularAthletes("Ding Junhui");
  assert.ok(ding.some((athlete) => athlete.name === "Ding Junhui"));
});
