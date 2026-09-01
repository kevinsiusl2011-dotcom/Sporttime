import assert from "node:assert/strict";
import test from "node:test";
import { athleteSearchTerms, eventMentionsAthlete, isRosterSport } from "./athlete.ts";
import type { SportEvent } from "./types.ts";

test("treats football codes as roster sports and cycling as individual", () => {
  assert.equal(isRosterSport("Soccer"), true);
  assert.equal(isRosterSport("Basketball"), true);
  assert.equal(isRosterSport("Cycling"), false);
  assert.equal(isRosterSport("Motorsport"), false);
});

test("uses last name when it is long enough", () => {
  assert.deepEqual(athleteSearchTerms("Tadej Pogačar"), ["Tadej Pogačar", "Pogačar"]);
  assert.deepEqual(athleteSearchTerms("Son"), ["Son"]);
});

test("does not search generic suffixes like Junior", () => {
  assert.deepEqual(athleteSearchTerms("Vinicius Junior"), ["Vinicius Junior"]);
});

test("matches rider names inside an event title", () => {
  const event = {
    title: "Tour de France Stage 14",
    description: "Startlist includes Tadej Pogacar",
    league: "UCI World Tour",
  } as SportEvent;
  assert.equal(eventMentionsAthlete(event, "Tadej Pogačar"), true);
  assert.equal(eventMentionsAthlete(event, "Lionel Messi"), false);
});

test("does not treat Junior as a unique athlete match", () => {
  const event = {
    title: "Gremio vs Junior Barranquilla",
    home: "Gremio",
    away: "Junior Barranquilla",
    description: "",
    league: "Copa Libertadores",
  } as SportEvent;
  assert.equal(eventMentionsAthlete(event, "Vinicius Junior"), false);
});
