import assert from "node:assert/strict";
import test from "node:test";
import { appleCalendarUrl, googleSubscribeUrl } from "./urls.ts";

test("Google subscribe links use the current calendar UI and a webcal cid", () => {
  const feed = "https://sporttime.example/api/calendar/token.ics";
  assert.equal(appleCalendarUrl(feed), "webcal://sporttime.example/api/calendar/token.ics");
  const google = googleSubscribeUrl(feed);
  assert.match(google, /^https:\/\/calendar\.google\.com\/calendar\/u\/0\/r\?cid=/);
  assert.ok(google.includes(encodeURIComponent("webcal://sporttime.example/api/calendar/token.ics")));
});
