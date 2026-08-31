import assert from "node:assert/strict";
import test from "node:test";
import { popularTeamGroups, popularTeamsForSport } from "./popular-teams.ts";

test("lists followable clubs and constructors", () => {
  const soccer = popularTeamsForSport("Soccer");
  assert.ok(soccer.length >= 150, `soccer ${soccer.length}`);
  assert.ok(soccer.some((team) => team.id === "133604"));
  assert.ok(soccer.some((team) => team.name === "Liverpool"));
  assert.ok(soccer.filter((team) => team.leagueId === "4328").length >= 20);
  assert.equal(popularTeamsForSport("Basketball").filter((team) => team.leagueId === "4387").length, 30);
  assert.equal(popularTeamsForSport("American Football").length, 32);
  assert.equal(popularTeamsForSport("Baseball").filter((team) => team.leagueId === "4424").length, 30);
  assert.equal(popularTeamsForSport("Ice Hockey").length, 32);
  assert.equal(popularTeamsForSport("Australian Football").length, 18);
  const motorsport = popularTeamGroups("Motorsport");
  assert.ok(motorsport.some((group) => group.league === "Formula 1" && group.teams.length >= 10));
  assert.equal(popularTeamsForSport("Snooker").length, 0);
});
