import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_TIME_ZONE,
  isValidTimeZone,
  resolveTimeZone,
  timeZoneClockLabel,
  timeZoneShortName,
  zonedHour,
} from "./timezone.ts";

test("accepts IANA zones and rejects junk", () => {
  assert.equal(isValidTimeZone("Asia/Hong_Kong"), true);
  assert.equal(isValidTimeZone("America/New_York"), true);
  assert.equal(isValidTimeZone("Not/AZone"), false);
  assert.equal(isValidTimeZone(""), false);
});

test("falls back to Hong Kong", () => {
  assert.equal(resolveTimeZone(null), DEFAULT_TIME_ZONE);
  assert.equal(resolveTimeZone("nope"), DEFAULT_TIME_ZONE);
  assert.equal(resolveTimeZone("Europe/London"), "Europe/London");
});

test("labels Hong Kong in the product languages", () => {
  assert.equal(timeZoneShortName("Asia/Hong_Kong", "zh-Hant"), "香港時間");
  assert.equal(timeZoneShortName("Asia/Hong_Kong", "en"), "HKT");
  assert.equal(timeZoneClockLabel("Asia/Tokyo", "zh-Hant"), "東京時間");
  assert.equal(timeZoneClockLabel("Europe/London", "en"), "London time");
});

test("reads the wall-clock hour in the given zone", () => {
  assert.equal(zonedHour("2026-09-01T14:00:00.000Z", "Asia/Hong_Kong"), 22);
  assert.equal(zonedHour("2026-09-01T14:00:00.000Z", "America/New_York"), 10);
  assert.equal(zonedHour("2026-09-01T14:00:00.000Z", "UTC"), 14);
});
