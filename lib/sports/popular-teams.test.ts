import assert from "node:assert/strict";
import test from "node:test";
import { popularTeamGroups, popularTeamsForSport } from "./popular-teams.ts";

test("lists followable clubs and constructors", () => {
  const soccer = popularTeamsForSport("Soccer");
  assert.ok(soccer.some((team) => team.id === "133604"));
  assert.ok(soccer.some((team) => team.name === "Liverpool"));
  const motorsport = popularTeamGroups("Motorsport");
  assert.ok(motorsport.some((group) => group.league === "Formula 1" && group.teams.length >= 8));
  assert.equal(popularTeamsForSport("Snooker").length, 0);
});
