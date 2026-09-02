import { normalizeKey } from "@/lib/i18n/names";
import type { SportEvent } from "@/lib/sports/types";

export const F1_LEAGUE_ID = "4370";

export function followWantsF1(follow: {
  kind: string;
  source_id: string;
  label: string;
  sport: string | null;
  extra_json: string | null;
}): boolean {
  if (follow.source_id === F1_LEAGUE_ID) return true;
  const label = normalizeKey(follow.label);
  const sport = normalizeKey(follow.sport ?? "");
  if (label === "f1" || label.includes("formula 1") || label.includes("formula1")) return true;
  if (follow.kind === "sport" && (sport.includes("motorsport") || label.includes("motorsport"))) return true;
  try {
    const extra = follow.extra_json ? (JSON.parse(follow.extra_json) as { leagueId?: string }) : {};
    if (extra.leagueId === F1_LEAGUE_ID) return true;
  } catch {
    // ignore malformed extras
  }
  return false;
}

function isFormula1Event(event: SportEvent): boolean {
  if (event.leagueId === F1_LEAGUE_ID) return true;
  return /formula\s*1|\bf1\b/i.test(`${event.league} ${event.title}`);
}

function isRaceLike(event: SportEvent): boolean {
  const name = `${event.sessionName ?? ""} ${event.title}`;
  return /\brace\b|\bsprint\b/i.test(name);
}

/** Prefer OpenF1 weekend sessions over a single TheSportsDB grand prix block. */
export function mergeOpenF1Sessions(events: Map<string, SportEvent>, sessions: SportEvent[]): Map<string, SportEvent> {
  for (const session of sessions) {
    events.set(`${session.source}:${session.sourceId}`, session);
  }
  const raceLike = sessions.filter(isRaceLike);
  if (raceLike.length === 0) return events;

  for (const [key, event] of [...events.entries()]) {
    if (event.source !== "thesportsdb" || !isFormula1Event(event)) continue;
    const start = new Date(event.start).getTime();
    const nearby = raceLike.some((session) => Math.abs(new Date(session.start).getTime() - start) < 3 * 60 * 60 * 1000);
    if (nearby) events.delete(key);
  }
  return events;
}
