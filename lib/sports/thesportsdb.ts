import { dbGet, dbRun } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { findCatalogLeague, leaguesForSport, searchCatalogLeagues } from "@/lib/sports/catalog";
import { currentSeason, nearbySeasons } from "@/lib/sports/season";
import { asRecords, resolveSearchQuery } from "@/lib/sports/search-query";
import { isUpcoming, normalizeEvent } from "@/lib/sports/normalize";
import type { CatalogLeague, CatalogTeam, SearchResults, SportEvent } from "@/lib/sports/types";

const BASE = "https://www.thesportsdb.com/api/v1/json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;
/** Free tier truncates season dumps; pull several rounds + a short day window instead. */
const FREE_ROUND_LOOKAHEAD = 6;
const FREE_DAY_HORIZON = 18;

type CacheRow = { payload_json: string; expires_at: number };

async function request<T>(path: string, cacheKey: string, ttl = CACHE_TTL_MS): Promise<T> {
  const now = Date.now();
  const cached = await dbGet<CacheRow>(
    "SELECT payload_json, expires_at FROM fixture_cache WHERE cache_key = ?",
    [cacheKey],
  );
  if (cached && cached.expires_at > now) {
    return JSON.parse(cached.payload_json) as T;
  }

  const configuredKey = getEnv().THESPORTSDB_API_KEY || "3";
  const keys = configuredKey === "3" ? ["3"] : [configuredKey, "3"];

  let response: Response | null = null;
  let lastError: unknown = null;
  for (const key of keys) {
    const url = `${BASE}/${key}/${path}`;
    try {
      response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;
      response = null;
      continue;
    }
    if (response.ok) break;
    lastError = new Error(`TheSportsDB ${response.status} for ${path}`);
    // Invalid keys / rate limits: try the next candidate key, else fall back to cache.
    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403 ||
      response.status === 404 ||
      response.status === 429
    ) {
      continue;
    }
    break;
  }

  if (!response) {
    if (cached) return JSON.parse(cached.payload_json) as T;
    throw lastError instanceof Error ? lastError : new Error(`TheSportsDB failed for ${path}`);
  }

  if (!response.ok) {
    if (cached) return JSON.parse(cached.payload_json) as T;
    throw new Error(`TheSportsDB ${response.status} for ${path}`);
  }

  const data = (await response.json()) as T;
  // Free/test keys often return a tiny truncated season slice; don't pin that for hours.
  const effectiveTtl = shortSeasonPayload(cacheKey, data) ? Math.min(ttl, 15 * 60 * 1000) : ttl;
  await dbRun(
    `INSERT INTO fixture_cache (cache_key, payload_json, fetched_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at, expires_at = excluded.expires_at`,
    [cacheKey, JSON.stringify(data), now, now + effectiveTtl],
  );

  return data;
}

function shortSeasonPayload(cacheKey: string, data: unknown): boolean {
  if (!cacheKey.startsWith("season:")) return false;
  if (!data || typeof data !== "object") return true;
  const events = (data as { events?: unknown }).events;
  return !Array.isArray(events) || events.length <= 8;
}

async function requestSafe<T>(path: string, cacheKey: string, fallback: T, ttl = CACHE_TTL_MS): Promise<T> {
  try {
    return await request<T>(path, cacheKey, ttl);
  } catch {
    return fallback;
  }
}

export async function lookupLeague(id: string): Promise<CatalogLeague | null> {
  try {
    const data = await request<{ leagues?: Array<Record<string, string>> }>(
      `lookupleague.php?id=${encodeURIComponent(id)}`,
      `league:${id}`,
      24 * 60 * 60 * 1000,
    );
    const raw = data.leagues?.[0];
    if (raw?.idLeague) {
      return {
        id: raw.idLeague,
        name: raw.strLeague,
        sport: raw.strSport,
        country: raw.strCountry || "",
        badge: raw.strBadge || raw.strLogo,
      };
    }
  } catch {
    // use the local catalogue when the live lookup is rate-limited
  }
  return findCatalogLeague(id);
}

export async function lookupTeam(id: string): Promise<CatalogTeam | null> {
  const data = await requestSafe<{ teams?: Array<Record<string, string>> }>(
    `lookupteam.php?id=${encodeURIComponent(id)}`,
    `team:${id}`,
    { teams: [] },
    24 * 60 * 60 * 1000,
  );
  const raw = asRecords(data.teams)[0];
  if (!raw?.idTeam) return null;
  return {
    id: raw.idTeam,
    name: raw.strTeam,
    sport: raw.strSport,
    league: raw.strLeague,
    leagueId: raw.idLeague,
    country: raw.strCountry,
    badge: raw.strBadge || raw.strTeamBadge,
  };
}

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return { leagues: [], teams: [], athletes: [] };

  const { catalogQuery, remoteQuery, skipRemoteLeagues } = resolveSearchQuery(q);
  const remoteKey = remoteQuery.toLowerCase();

  const [teamsData, playersData, leagueAny] = await Promise.all([
    requestSafe<{ teams?: unknown }>(
      `searchteams.php?t=${encodeURIComponent(remoteQuery)}`,
      `search:team:${remoteKey}`,
      { teams: [] },
      30 * 60 * 1000,
    ),
    requestSafe<{ player?: unknown }>(
      `searchplayers.php?p=${encodeURIComponent(remoteQuery)}`,
      `search:player:${remoteKey}`,
      { player: [] },
      30 * 60 * 1000,
    ),
    skipRemoteLeagues
      ? Promise.resolve({ countries: [] as unknown })
      : requestSafe<{ countries?: unknown }>(
          `search_all_leagues.php?l=${encodeURIComponent(remoteQuery)}`,
          `search:league:${remoteKey}`,
          { countries: [] },
          30 * 60 * 1000,
        ),
  ]);

  const needle = remoteQuery.toLowerCase();
  const remoteLeagues = asRecords(leagueAny.countries)
    .filter((item) => item.strLeague?.toLowerCase().includes(needle) || item.idLeague === q)
    .map((item) => ({
      id: item.idLeague,
      name: item.strLeague,
      sport: item.strSport,
      country: item.strCountry || "",
      badge: item.strBadge,
    }));
  const leagues = uniqueBy(
    [...searchCatalogLeagues(catalogQuery), ...searchCatalogLeagues(remoteQuery), ...remoteLeagues],
    (item) => item.id,
  ).slice(0, 16);

  const teams = uniqueBy(
    asRecords(teamsData.teams).map((item) => ({
      id: item.idTeam,
      name: item.strTeam,
      sport: item.strSport,
      league: item.strLeague,
      leagueId: item.idLeague,
      country: item.strCountry,
      badge: item.strBadge || item.strTeamBadge,
    })),
    (item) => item.id,
  ).slice(0, 12);

  const athletes = uniqueBy(
    asRecords(playersData.player).map((item) => ({
      id: item.idPlayer,
      name: item.strPlayer,
      sport: item.strSport,
      team: item.strTeam,
      teamId: item.idTeam,
      nationality: item.strNationality,
      thumb: item.strThumb || item.strCutout,
    })),
    (item) => item.id,
  ).slice(0, 12);

  return { leagues, teams, athletes };
}

export async function listLeagueTeams(leagueId: string): Promise<CatalogTeam[]> {
  const data = await requestSafe<{ teams?: Array<Record<string, string>> }>(
    `lookup_all_teams.php?id=${encodeURIComponent(leagueId)}`,
    `league-teams:${leagueId}`,
    { teams: [] },
    24 * 60 * 60 * 1000,
  );
  return asRecords(data.teams).map((item) => ({
    id: item.idTeam,
    name: item.strTeam,
    sport: item.strSport,
    league: item.strLeague,
    leagueId: item.idLeague || leagueId,
    country: item.strCountry,
    badge: item.strBadge || item.strTeamBadge,
  }));
}

function toUpcoming(raw: unknown): SportEvent[] {
  return uniqueBy(
    asRecords(raw)
      .map((item) => normalizeEvent(item))
      .filter((event): event is SportEvent => Boolean(event && isUpcoming(event))),
    (event) => event.sourceId,
  ).sort((a, b) => a.start.localeCompare(b.start));
}

export async function nextLeagueEvents(leagueId: string): Promise<SportEvent[]> {
  const data = await requestSafe<{ events?: Array<Record<string, string>> }>(
    `eventsnextleague.php?id=${encodeURIComponent(leagueId)}`,
    `next-league:${leagueId}`,
    { events: [] },
    3 * 60 * 60 * 1000,
  );
  return toUpcoming(data.events);
}

export async function nextTeamEvents(teamId: string): Promise<SportEvent[]> {
  const data = await requestSafe<{ events?: Array<Record<string, string>> }>(
    `eventsnext.php?id=${encodeURIComponent(teamId)}`,
    `next-team:${teamId}`,
    { events: [] },
    3 * 60 * 60 * 1000,
  );
  return toUpcoming(data.events);
}

async function roundEvents(leagueId: string, season: string, round: number): Promise<SportEvent[]> {
  if (!Number.isFinite(round) || round < 1) return [];
  const data = await requestSafe<{ events?: Array<Record<string, string>> }>(
    `eventsround.php?id=${encodeURIComponent(leagueId)}&r=${encodeURIComponent(String(round))}&s=${encodeURIComponent(season)}`,
    `round:${leagueId}:${season}:${round}`,
    { events: [] },
    3 * 60 * 60 * 1000,
  );
  return toUpcoming(data.events);
}

function dayStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function leagueDayHorizon(leagueId: string, days: number): Promise<SportEvent[]> {
  const start = new Date();
  const stamps = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    return dayStamp(date);
  });
  const batches = await mapPool(stamps, 3, async (stamp) => {
    const data = await requestSafe<{ events?: Array<Record<string, string>> }>(
      `eventsday.php?d=${encodeURIComponent(stamp)}&l=${encodeURIComponent(leagueId)}`,
      `day-league:${leagueId}:${stamp}`,
      { events: [] },
      3 * 60 * 60 * 1000,
    );
    return toUpcoming(data.events);
  });
  return uniqueBy(batches.flat(), (event) => event.sourceId);
}

function seedRound(rawEvents: unknown): number | null {
  for (const item of asRecords(rawEvents)) {
    const value = Number(item.intRound);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

export async function seasonEvents(leagueId: string, sport = "Soccer"): Promise<SportEvent[]> {
  const season = currentSeason(sport);
  const nextData = await requestSafe<{ events?: Array<Record<string, string>> }>(
    `eventsnextleague.php?id=${encodeURIComponent(leagueId)}`,
    `next-league:${leagueId}`,
    { events: [] },
    3 * 60 * 60 * 1000,
  );
  const next = toUpcoming(nextData.events);
  const roundStart = Math.max(1, (seedRound(nextData.events) ?? 1) - 1);
  const roundNumbers = Array.from({ length: FREE_ROUND_LOOKAHEAD }, (_, index) => roundStart + index);

  const rounds = await mapPool(roundNumbers, 3, (round) => roundEvents(leagueId, season, round));
  let merged = uniqueBy([...next, ...rounds.flat()], (event) => event.sourceId);

  // Non-round sports (or sparse rounds) still need a day window on the free tier.
  if (merged.length < 8) {
    const days = await leagueDayHorizon(leagueId, FREE_DAY_HORIZON);
    merged = uniqueBy([...merged, ...days], (event) => event.sourceId);
  }

  if (merged.length > 0) {
    return merged.sort((a, b) => a.start.localeCompare(b.start));
  }

  for (const nearby of nearbySeasons(sport)) {
    const data = await requestSafe<{ events?: Array<Record<string, string>> }>(
      `eventsseason.php?id=${encodeURIComponent(leagueId)}&s=${encodeURIComponent(nearby)}`,
      `season:${leagueId}:${nearby}`,
      { events: [] },
    );
    const upcoming = toUpcoming(data.events);
    if (upcoming.length > 0) return upcoming;
  }
  return [];
}

async function mapPool<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()));
  return results;
}

export async function upcomingForFollow(follow: {
  kind: string;
  source_id: string;
  label: string;
  sport: string | null;
  extra_json: string | null;
}): Promise<SportEvent[]> {
  if (follow.kind === "league") {
    return seasonEvents(follow.source_id, follow.sport ?? "Soccer");
  }

  if (follow.kind === "team") {
    const extra = safeJson(follow.extra_json);
    const leagueId = extra.leagueId as string | undefined;
    const [next, fromLeague] = await Promise.all([
      nextTeamEvents(follow.source_id),
      leagueId
        ? seasonEvents(leagueId, follow.sport ?? "Soccer").then((events) =>
            events.filter((event) =>
              [event.home, event.away, event.title].some((value) =>
                value?.toLowerCase().includes(follow.label.toLowerCase()),
              ),
            ),
          )
        : Promise.resolve([] as SportEvent[]),
    ]);
    if (next.length + fromLeague.length > 0) {
      return uniqueBy([...next, ...fromLeague], (event) => event.sourceId).sort((a, b) =>
        a.start.localeCompare(b.start),
      );
    }
    const team = await lookupTeam(follow.source_id);
    if (team?.leagueId) {
      return (await seasonEvents(team.leagueId, team.sport)).filter((event) =>
        [event.home, event.away].some((value) => value?.toLowerCase() === team.name.toLowerCase()),
      );
    }
  }

  if (follow.kind === "athlete") {
    const extra = safeJson(follow.extra_json);
    const teamId = extra.teamId as string | undefined;
    if (teamId) {
      return upcomingForFollow({
        kind: "team",
        source_id: teamId,
        label: String(extra.team ?? follow.label),
        sport: follow.sport,
        extra_json: JSON.stringify({ leagueId: extra.leagueId }),
      });
    }
    const data = await request<{ event?: Array<Record<string, string>> }>(
      `searchevents.php?e=${encodeURIComponent(follow.label)}`,
      `search-events:${follow.label.toLowerCase()}`,
      60 * 60 * 1000,
    );
    return asRecords(data.event)
      .map((raw) => normalizeEvent(raw))
      .filter((event): event is SportEvent => Boolean(event && isUpcoming(event)));
  }

  if (follow.kind === "sport") {
    const leagues = leaguesForSport(follow.label || follow.source_id).slice(0, 10);
    const batches = await Promise.all(leagues.map((league) => nextLeagueEvents(league.id)));
    return uniqueBy(batches.flat(), (event) => event.sourceId).sort((a, b) => a.start.localeCompare(b.start));
  }

  return [];
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const id = key(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }
  return result;
}

function safeJson(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}
