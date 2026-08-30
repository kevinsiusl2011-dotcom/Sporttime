import assert from "node:assert/strict";
import test from "node:test";
import { searchCatalogLeagues } from "./catalog.ts";
import { asRecords, resolveSearchQuery } from "./search-query.ts";

test("maps nicknames and Chinese names to TheSportsDB queries", () => {
  assert.equal(resolveSearchQuery("POGI").remoteQuery, "Tadej Pogacar");
  assert.equal(resolveSearchQuery("pogi").skipRemoteLeagues, true);
  assert.equal(resolveSearchQuery("波加查").remoteQuery, "Tadej Pogacar");
  assert.equal(resolveSearchQuery("MESSI").remoteQuery, "Lionel Messi");
  assert.equal(resolveSearchQuery("美斯").remoteQuery, "Lionel Messi");
  assert.equal(resolveSearchQuery("大谷翔平").remoteQuery, "Shohei Ohtani");
  assert.equal(resolveSearchQuery("英超").remoteQuery, "premier league");
});

test("keeps ordinary queries unchanged", () => {
  const resolved = resolveSearchQuery("Liverpool");
  assert.equal(resolved.remoteQuery, "Liverpool");
  assert.equal(resolved.skipRemoteLeagues, false);
});

test("treats TheSportsDB error strings as empty lists", () => {
  assert.deepEqual(asRecords("Invalid name passed"), []);
  assert.deepEqual(asRecords(null), []);
  assert.deepEqual(asRecords([{ idLeague: "4328", strLeague: "Premier League" }]), [
    { idLeague: "4328", strLeague: "Premier League" },
  ]);
});

test("finds featured leagues by Chinese name", () => {
  const hits = searchCatalogLeagues("英超");
  assert.ok(hits.some((league) => league.id === "4328"));
});
