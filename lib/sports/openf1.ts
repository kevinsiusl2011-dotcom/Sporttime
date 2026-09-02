import { dbGet, dbRun } from "@/lib/db";
import { isUpcoming } from "@/lib/sports/normalize";
import type { SportEvent } from "@/lib/sports/types";

const OPENF1 = "https://api.openf1.org/v1";
const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;

type CacheRow = { payload_json: string; expires_at: number };

type OpenF1Session = {
  session_key?: number;
  session_name?: string;
  session_type?: string;
  date_start?: string;
  date_end?: string;
  circuit_short_name?: string;
  location?: string;
  country_name?: string;
  meeting_key?: number;
  year?: number;
};

function sessionDurationMs(name: string, type: string): number {
  const key = `${name} ${type}`.toLowerCase();
  if (key.includes("race") && !key.includes("sprint")) return 2 * 60 * 60 * 1000;
  if (key.includes("sprint")) return 75 * 60 * 1000;
  if (key.includes("qualifying")) return 60 * 60 * 1000;
  return 90 * 60 * 1000;
}

async function cachedSessions(year: number): Promise<OpenF1Session[]> {
  const cacheKey = `openf1:sessions:${year}`;
  const now = Date.now();
  const cached = await dbGet<CacheRow>(
    "SELECT payload_json, expires_at FROM fixture_cache WHERE cache_key = ?",
    [cacheKey],
  );
  if (cached && cached.expires_at > now) {
    try {
      return JSON.parse(cached.payload_json) as OpenF1Session[];
    } catch {
      // refetch
    }
  }

  const url = `${OPENF1}/sessions?year=${year}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    if (cached) return JSON.parse(cached.payload_json) as OpenF1Session[];
    throw new Error(`OpenF1 ${response.status}`);
  }
  const data = (await response.json()) as OpenF1Session[];
  const payload = Array.isArray(data) ? data : [];
  await dbRun(
    `INSERT INTO fixture_cache (cache_key, payload_json, fetched_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at, expires_at = excluded.expires_at`,
    [cacheKey, JSON.stringify(payload), now, now + CACHE_TTL_MS],
  );
  return payload;
}

export function sessionToEvent(raw: OpenF1Session): SportEvent | null {
  if (!raw.session_key || !raw.date_start) return null;
  const start = new Date(raw.date_start);
  if (Number.isNaN(start.getTime())) return null;
  const named = raw.session_name || raw.session_type || "Session";
  const end = raw.date_end
    ? new Date(raw.date_end)
    : new Date(start.getTime() + sessionDurationMs(named, raw.session_type || ""));
  if (Number.isNaN(end.getTime())) return null;

  const meeting = [raw.location || raw.circuit_short_name, raw.country_name].filter(Boolean).join(", ");
  const circuit = raw.circuit_short_name || raw.location || "Grand Prix";
  const title = `${circuit} Grand Prix — ${named}`;
  const location = [raw.circuit_short_name, raw.location, raw.country_name].filter(Boolean).join(", ");

  return {
    source: "openf1",
    sourceId: String(raw.session_key),
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    timeConfirmed: true,
    location,
    description: meeting,
    sport: "Motorsport",
    league: "Formula 1",
    leagueId: "4370",
    venue: raw.circuit_short_name,
    city: raw.location,
    country: raw.country_name,
    kind: "session",
    sessionName: named,
  };
}

export async function upcomingF1Sessions(now = new Date()): Promise<SportEvent[]> {
  const year = now.getUTCFullYear();
  const years = now.getUTCMonth() >= 10 ? [year, year + 1] : [year];
  const batches = await Promise.all(
    years.map(async (value) => {
      try {
        return await cachedSessions(value);
      } catch (error) {
        console.error("OpenF1 sessions failed", value, error);
        return [] as OpenF1Session[];
      }
    }),
  );

  return batches
    .flat()
    .map(sessionToEvent)
    .filter((event): event is SportEvent => Boolean(event && isUpcoming(event, now)))
    .sort((a, b) => a.start.localeCompare(b.start));
}
