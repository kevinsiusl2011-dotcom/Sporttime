import { eventFingerprint } from "@/lib/sports/normalize";
import type { SportEvent } from "@/lib/sports/types";

export type FeedRevision = {
  sequence: number;
  stamp: string;
  hash: string;
};

export type StoredFeed = {
  events: SportEvent[];
  revisions: Record<string, FeedRevision>;
};

export function eventRevisionKey(event: Pick<SportEvent, "source" | "sourceId">) {
  return `${event.source}:${event.sourceId}`;
}

export function parseStoredFeed(json: string | null | undefined): StoredFeed {
  if (!json) return { events: [], revisions: {} };
  try {
    const data = JSON.parse(json) as unknown;
    if (Array.isArray(data)) {
      return { events: data as SportEvent[], revisions: {} };
    }
    if (data && typeof data === "object" && Array.isArray((data as StoredFeed).events)) {
      const stored = data as StoredFeed;
      return {
        events: stored.events,
        revisions: stored.revisions && typeof stored.revisions === "object" ? stored.revisions : {},
      };
    }
  } catch {
    // fall through
  }
  return { events: [], revisions: {} };
}

export function serializeStoredFeed(events: SportEvent[], revisions: Record<string, FeedRevision>) {
  return JSON.stringify({ v: 1, events, revisions } satisfies StoredFeed & { v: 1 });
}

export function nextRevisions(
  events: SportEvent[],
  previous: Record<string, FeedRevision>,
  nowIso: string,
): Record<string, FeedRevision> {
  const revisions: Record<string, FeedRevision> = {};
  for (const event of events) {
    const key = eventRevisionKey(event);
    const hash = eventFingerprint(event);
    const prior = previous[key];
    if (prior && prior.hash === hash) {
      revisions[key] = prior;
      continue;
    }
    revisions[key] = {
      sequence: prior ? prior.sequence + 1 : 0,
      stamp: monotonicStamp(prior?.stamp, nowIso),
      hash,
    };
  }
  return revisions;
}

function monotonicStamp(previous: string | undefined, nowIso: string) {
  if (!previous) return nowIso;
  return Date.parse(nowIso) > Date.parse(previous) ? nowIso : new Date(Date.parse(previous) + 1000).toISOString();
}
