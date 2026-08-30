import assert from "node:assert/strict";
import test from "node:test";
import { parseFeedToken } from "./token.ts";

test("extracts a feed token from a calendar URL", () => {
  assert.equal(
    parseFeedToken("https://sporttime-delta.vercel.app/api/calendar/abcDEF1234567890xyz.ics"),
    "abcDEF1234567890xyz",
  );
  assert.equal(parseFeedToken("abcDEF1234567890xyz"), "abcDEF1234567890xyz");
  assert.equal(parseFeedToken("  abcDEF1234567890xyz.ics  "), "abcDEF1234567890xyz");
});
