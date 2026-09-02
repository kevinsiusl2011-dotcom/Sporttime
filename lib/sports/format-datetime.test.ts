import assert from "node:assert/strict";
import test from "node:test";
import { addCalendarDays, formatDateTime, formatTime, isoOnZonedDay, zonedYmd } from "../utils.ts";

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

test("can format the same instant in Tokyo", () => {
  const text = formatDateTime("2026-09-12T14:00:00.000Z", "zh-Hant", "Asia/Tokyo");
  assert.match(text, /23:00/);
  assert.doesNotMatch(text, /香港時間/);
});

test("keys fixtures by Hong Kong calendar day", () => {
  assert.equal(zonedYmd("2026-09-12T14:00:00.000Z"), "2026-09-12");
  assert.equal(zonedYmd("2026-09-12T16:30:00.000Z"), "2026-09-13");
});

test("adds civil days without using the wall clock", () => {
  assert.equal(addCalendarDays("2026-09-12", 1), "2026-09-13");
  assert.equal(addCalendarDays("2026-12-31", 1), "2027-01-01");
});

test("picks an instant that still falls on the zoned civil day", () => {
  const auckland = isoOnZonedDay("2026-09-01", "Pacific/Auckland");
  assert.equal(zonedYmd(auckland, "Pacific/Auckland"), "2026-09-01");
  const la = isoOnZonedDay("2026-09-01", "America/Los_Angeles");
  assert.equal(zonedYmd(la, "America/Los_Angeles"), "2026-09-01");
});

test("shows kickoff time only in 24-hour Hong Kong clock", () => {
  assert.equal(formatTime("2026-09-12T14:00:00.000Z", "zh-Hant"), "22:00");
  assert.equal(formatTime("2026-09-12T14:00:00.000Z", "en"), "22:00");
});
