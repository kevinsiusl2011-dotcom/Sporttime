import assert from "node:assert/strict";
import test from "node:test";
import { calendarEtag, calendarFeedHeaders, ifNoneMatchHits } from "./http.ts";

test("sends revalidate headers so Google can pick up a rebuilt feed", () => {
  const headers = calendarFeedHeaders(1_725_000_000_000, { sport: "Soccer" });
  assert.equal(headers["Content-Type"], "text/calendar; charset=utf-8");
  assert.match(headers["Cache-Control"], /must-revalidate/);
  assert.equal(headers.ETag, calendarEtag(1_725_000_000_000, { sport: "Soccer" }));
  assert.ok(ifNoneMatchHits(new Request("https://example.com", { headers: { "if-none-match": headers.ETag } }), headers.ETag));
  assert.equal(
    ifNoneMatchHits(new Request("https://example.com"), headers.ETag),
    false,
  );
});
