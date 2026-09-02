import { dbGet, dbRun } from "@/lib/db";
import { isUpcoming } from "@/lib/sports/normalize";
import type { SportEvent } from "@/lib/sports/types";

const BASE = "https://app.ticketmaster.com/discovery/v2/events.json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;

type CacheRow = { payload_json: string; expires_at: number };

type TicketmasterEvent = {
  id?: string;
  name?: string;
  url?: string;
  dates?: {
    start?: { dateTime?: string; localDate?: string; dateTBD?: boolean; timeTBA?: boolean };
    timezone?: string;
  };
  _embedded?: { venues?: Array<{ name?: string; city?: { name?: string }; country?: { name?: string } }> };
  classifications?: Array<{
    segment?: { name?: string };
    genre?: { name?: string };
  }>;
};

type DiscoveryPayload = {
  _embedded?: { events?: TicketmasterEvent[] };
};

export function ticketmasterConfigured(): boolean {
  return Boolean(process.env.TICKETMASTER_API_KEY?.trim());
}

function looksLikeFixture(name: string): boolean {
  return /\s+vs\.?\s+|\s+v\s+/i.test(name);
}

export function ticketmasterToEvent(raw: TicketmasterEvent, sport?: string | null): SportEvent | null {
  if (!raw.id || !raw.name) return null;
  if (looksLikeFixture(raw.name)) return null;
  const segment = raw.classifications?.[0]?.segment?.name ?? "";
  if (segment.toLowerCase() === "sports" && looksLikeFixture(raw.name)) return null;

  const startRaw = raw.dates?.start?.dateTime;
  const localDate = raw.dates?.start?.localDate;
  const timeConfirmed = Boolean(startRaw) && !raw.dates?.start?.dateTBD && !raw.dates?.start?.timeTBA;
  const start = startRaw ? new Date(startRaw) : localDate ? new Date(`${localDate}T12:00:00Z`) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const venue = raw._embedded?.venues?.[0];
  const location = [venue?.name, venue?.city?.name, venue?.country?.name].filter(Boolean).join(", ");

  return {
    source: "ticketmaster",
    sourceId: raw.id,
    title: raw.name,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: !timeConfirmed,
    timeConfirmed,
    location,
    description: raw.url || "Public ticketed appearance",
    sport: sport || "Appearance",
    league: raw.classifications?.[0]?.genre?.name || "Appearance",
    venue: venue?.name,
    city: venue?.city?.name,
    country: venue?.country?.name,
    kind: "appearance",
  };
}

async function searchAppearances(keyword: string): Promise<TicketmasterEvent[]> {
  const key = process.env.TICKETMASTER_API_KEY?.trim();
  if (!key) return [];
  const cacheKey = `ticketmaster:events:${keyword.toLowerCase()}`;
  const now = Date.now();
  const cached = await dbGet<CacheRow>(
    "SELECT payload_json, expires_at FROM fixture_cache WHERE cache_key = ?",
    [cacheKey],
  );
  if (cached && cached.expires_at > now) {
    try {
      return JSON.parse(cached.payload_json) as TicketmasterEvent[];
    } catch {
      // refetch
    }
  }

  const startDateTime = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const url = `${BASE}?apikey=${encodeURIComponent(key)}&keyword=${encodeURIComponent(keyword)}&size=15&sort=date,asc&startDateTime=${encodeURIComponent(startDateTime)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    if (cached) return JSON.parse(cached.payload_json) as TicketmasterEvent[];
    throw new Error(`Ticketmaster ${response.status}`);
  }
  const data = (await response.json()) as DiscoveryPayload;
  const events = data._embedded?.events ?? [];
  await dbRun(
    `INSERT INTO fixture_cache (cache_key, payload_json, fetched_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at, expires_at = excluded.expires_at`,
    [cacheKey, JSON.stringify(events), now, now + CACHE_TTL_MS],
  );
  return events;
}

export async function appearancesForAthletes(
  athletes: Array<{ label: string; sport: string | null }>,
  now = new Date(),
): Promise<SportEvent[]> {
  if (!ticketmasterConfigured() || athletes.length === 0) return [];
  const batches = await Promise.all(
    athletes.slice(0, 8).map(async (athlete) => {
      try {
        const raw = await searchAppearances(athlete.label);
        return raw
          .map((item) => ticketmasterToEvent(item, athlete.sport))
          .filter((event): event is SportEvent => Boolean(event && isUpcoming(event, now)));
      } catch (error) {
        console.error("Ticketmaster search failed", athlete.label, error);
        return [] as SportEvent[];
      }
    }),
  );
  const seen = new Set<string>();
  const result: SportEvent[] = [];
  for (const event of batches.flat()) {
    if (seen.has(event.sourceId)) continue;
    seen.add(event.sourceId);
    result.push(event);
  }
  return result.sort((a, b) => a.start.localeCompare(b.start));
}
