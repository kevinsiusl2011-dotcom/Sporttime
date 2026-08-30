import assert from "node:assert/strict";
import test from "node:test";
import { formatDateTime } from "../utils.ts";

test("shows kickoff in Hong Kong time instead of UTC", () => {
  const text = formatDateTime("2026-09-12T14:00:00.000Z", "zh-Hant");
  assert.match(text, /22:00/);
  assert.doesNotMatch(text, /14:00/);
  assert.match(text, /香港時間/);
});

test("keeps English copy on the same Hong Kong clock", () => {
  const text = formatDateTime("2026-09-12T11:00:00.000Z", "en");
  assert.match(text, /19:00/);
  assert.match(text, /HKT/);
});

test("uses simplified copy for Hong Kong time", () => {
  const text = formatDateTime("2026-09-12T14:00:00.000Z", "zh-Hans");
  assert.match(text, /22:00/);
  assert.match(text, /香港时间/);
});
