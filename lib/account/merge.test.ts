import assert from "node:assert/strict";
import test from "node:test";
import { resolveFeedTokens } from "./merge.ts";

test("keeps a single token on either side", () => {
  assert.deepEqual(resolveFeedTokens("guest-token-123456", null, "from"), {
    feedToken: "guest-token-123456",
    alias: null,
  });
  assert.deepEqual(resolveFeedTokens(null, "google-token-123456", "from"), {
    feedToken: "google-token-123456",
    alias: null,
  });
});

test("signs in without dropping the guest calendar URL", () => {
  assert.deepEqual(resolveFeedTokens("guest-token-123456", "google-token-123456", "from"), {
    feedToken: "guest-token-123456",
    alias: "google-token-123456",
  });
});

test("restore keeps the pasted calendar URL as primary", () => {
  assert.deepEqual(resolveFeedTokens("guest-token-123456", "saved-token-123456", "to"), {
    feedToken: "saved-token-123456",
    alias: "guest-token-123456",
  });
});
