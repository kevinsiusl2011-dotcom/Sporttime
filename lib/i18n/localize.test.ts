import assert from "node:assert/strict";
import test from "node:test";
import { eventDescription, eventSummary, localizeText, trilingual } from "./localize.ts";

test("localizes a known matchup into both Chinese scripts", () => {
  const text = localizeText("Arsenal vs Chelsea");
  assert.equal(text.hant, "阿仙奴對車路士");
  assert.equal(text.hans, "阿森纳对切尔西");
  assert.equal(text.en, "Arsenal vs Chelsea");
});

test("keeps unknown names in English while translating vs", () => {
  const text = localizeText("Foo United vs Bar City");
  assert.equal(text.hant, "Foo United對Bar City");
  assert.equal(text.hans, "Foo United对Bar City");
});

test("builds a trilingual calendar summary", () => {
  const summary = eventSummary("English Premier League", "Manchester City vs Liverpool");
  assert.equal(summary, "英超：曼城對利物浦（簡體：英超：曼城对利物浦；English Premier League: Manchester City vs Liverpool）");
});

test("collapses identical scripts", () => {
  assert.equal(trilingual("NBA"), "NBA");
  assert.equal(trilingual("Soccer"), "足球（Soccer）");
});

test("writes calendar details as one paragraph", () => {
  const description = eventDescription({
    league: "English Premier League",
    title: "Arsenal vs Chelsea",
    location: "Emirates Stadium",
    timeConfirmed: true,
  });
  assert.match(description, /繁體是英超：阿仙奴對車路士/);
  assert.match(description, /簡體是英超：阿森纳对切尔西/);
  assert.match(description, /英文是 English Premier League: Arsenal vs Chelsea/);
  assert.equal(description.includes("\n"), false);
});

test("shows Chinese names for Messi and Pogacar", () => {
  assert.match(trilingual("Lionel Messi"), /美斯/);
  assert.match(trilingual("Tadej Pogačar"), /波加查/);
});
