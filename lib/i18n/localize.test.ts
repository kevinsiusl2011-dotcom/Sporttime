import assert from "node:assert/strict";
import test from "node:test";
import { displayName, eventDescription, eventSummary, joinedNameLines, localizeText, nameLines } from "./localize.ts";

test("localizes a known matchup into both Chinese scripts", () => {
  const text = localizeText("Arsenal vs Chelsea");
  assert.equal(text.hant, "阿仙奴對車路士");
  assert.equal(text.hans, "阿森纳对切尔西");
  assert.equal(text.en, "Arsenal vs Chelsea");
});

test("keeps unknown matchups fully in English", () => {
  const text = localizeText("Foo United vs Bar City");
  assert.equal(text.hant, "Foo United vs Bar City");
  assert.equal(text.hans, "Foo United vs Bar City");
});

test("spaces a mixed-script matchup instead of gluing English to 對", () => {
  const text = localizeText("Arsenal vs Foo United");
  assert.equal(text.hant, "阿仙奴對 Foo United");
  assert.equal(text.hans, "阿森纳对 Foo United");
});

test("shows one language at a time for team names", () => {
  assert.equal(displayName("Arsenal", "zh-Hant"), "阿仙奴");
  assert.equal(displayName("Arsenal", "zh-Hans"), "阿森纳");
  assert.equal(displayName("Arsenal", "en"), "Arsenal");
  assert.equal(displayName("Soccer", "zh-Hant"), "足球");
  assert.equal(displayName("Soccer", "en"), "Soccer");
  assert.equal(displayName("NBA", "zh-Hant"), "NBA");
});

test("pairs Chinese and English on separate lines", () => {
  assert.deepEqual(nameLines("Arsenal", "zh-Hant"), { primary: "阿仙奴", secondary: "Arsenal" });
  assert.deepEqual(nameLines("Arsenal", "zh-Hans"), { primary: "阿森纳", secondary: "Arsenal" });
  assert.deepEqual(nameLines("Arsenal", "en"), { primary: "Arsenal" });
  assert.deepEqual(nameLines("NBA", "zh-Hant"), { primary: "NBA" });
  assert.deepEqual(nameLines("Arsenal vs Chelsea", "zh-Hant"), {
    primary: "阿仙奴對車路士",
    secondary: "Arsenal vs Chelsea",
  });
  assert.deepEqual(nameLines("Arsenal vs Chelsea", "zh-Hans"), {
    primary: "阿森纳对切尔西",
    secondary: "Arsenal vs Chelsea",
  });
});

test("joins sport and country as one bilingual pair", () => {
  assert.deepEqual(joinedNameLines(["Soccer", "England"], "zh-Hant"), {
    primary: "足球 · 英格蘭",
    secondary: "Soccer · England",
  });
});

test("matches club names with FC suffixes", () => {
  assert.equal(displayName("Liverpool FC", "zh-Hant"), "利物浦");
  assert.equal(displayName("Arsenal F.C.", "zh-Hant"), "阿仙奴");
});

test("builds a Chinese calendar summary", () => {
  const summary = eventSummary("English Premier League", "Manchester City vs Liverpool");
  assert.equal(summary, "英超：曼城對利物浦");
});

test("writes calendar details as one paragraph", () => {
  const description = eventDescription({
    league: "English Premier League",
    title: "Arsenal vs Chelsea",
    location: "Emirates Stadium",
    timeConfirmed: true,
  });
  assert.match(description, /^英超：阿仙奴對車路士。/);
  assert.match(description, /English Premier League: Arsenal vs Chelsea/);
  assert.doesNotMatch(description, /簡體是/);
  assert.equal(description.includes("\n"), false);
});

test("shows Chinese names for Messi and Pogacar", () => {
  assert.equal(displayName("Lionel Messi", "zh-Hant"), "美斯");
  assert.equal(displayName("Tadej Pogačar", "zh-Hant"), "波加查");
});
