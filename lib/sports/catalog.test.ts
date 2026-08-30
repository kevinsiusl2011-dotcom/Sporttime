import assert from "node:assert/strict";
import test from "node:test";
import {
  findCatalogLeague,
  leaguesForSport,
  listCatalogSports,
  searchCatalogLeagues,
  sportSlug,
} from "./catalog.ts";

test("lists many sports and keeps league ids unique", () => {
  const sports = listCatalogSports();
  assert.ok(sports.includes("Soccer"));
  assert.ok(sports.includes("Esports"));
  assert.ok(sports.includes("Cycling"));
  assert.ok(sports.includes("Badminton"));
  assert.ok(sports.includes("Table Tennis"));
  assert.ok(sports.includes("Skiing"));
  assert.ok(sports.includes("Snooker"));
  assert.ok(!sports.includes("Horse Racing"));
  assert.ok(sports.length >= 20);
});

test("finds leagues by sport slug", () => {
  const football = leaguesForSport("american-football");
  assert.ok(football.some((league) => league.id === "4391"));
});

test("search covers aliases even when the API is limited", () => {
  const worlds = searchCatalogLeagues("Tour de France");
  assert.ok(worlds.some((league) => league.id === "4465"));
  const kleague = searchCatalogLeagues("K League");
  assert.equal(kleague[0]?.id, "4689");
  const bwf = searchCatalogLeagues("BWF");
  assert.ok(bwf.some((league) => league.id === "5646"));
  const snooker = searchCatalogLeagues("桌球");
  assert.ok(snooker.some((league) => league.id === "4555"));
  assert.equal(searchCatalogLeagues("跑馬").length, 0);
});

test("uses the real World Cup and J1 ids", () => {
  assert.equal(findCatalogLeague("4429")?.name, "FIFA World Cup");
  assert.equal(findCatalogLeague("4633")?.name, "Japanese J1 League");
  assert.equal(sportSlug("American Football"), "american-football");
});
