import assert from "node:assert/strict";
import test from "node:test";
import { clubNamesMatch, eventInvolvesClub } from "./club-name.ts";

test("matches common club aliases and stripped FC names", () => {
  assert.equal(clubNamesMatch("Paris Saint-Germain", "Paris SG"), true);
  assert.equal(clubNamesMatch("Manchester United", "Man United"), true);
  assert.equal(clubNamesMatch("FC Barcelona", "Barcelona"), true);
  assert.equal(clubNamesMatch("Liverpool", "Chelsea"), false);
});

test("matches a fixture by home or away alias", () => {
  const event = { home: "Paris SG", away: "Barcelona", title: "Paris SG vs Barcelona" };
  assert.equal(eventInvolvesClub(event, "Paris Saint-Germain"), true);
  assert.equal(eventInvolvesClub(event, "FC Barcelona"), true);
  assert.equal(eventInvolvesClub(event, "Arsenal"), false);
});
